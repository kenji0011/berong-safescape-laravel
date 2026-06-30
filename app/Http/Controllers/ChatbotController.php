<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    public function respond(Request $request)
    {
        // Prevent PHP from killing the script if AI takes more than 30s
        set_time_limit(120);

        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'sometimes|array',
            'history.*.role' => 'required|string|in:user,bot',
            'history.*.text' => 'required|string'
        ]);

        $userMessage = $request->input('message');
        $apiKey = env('GEMINI_API_KEY');

        if (empty($apiKey)) {
            return response()->json([
                'response' => "I'm sorry, my AI features are currently disabled because the API key is missing. Please contact the administrator.",
                'error' => true
            ]);
        }

        // 1. Perform Local RAG (Retrieve relevant CSV rows)
        $relevantContext = $this->searchDataset($userMessage, 15); // Get top 15 most relevant Q&A pairs

        // 2. Build the prompt for Google Gemini
        $systemPrompt = "You are Berong, the friendly Bureau of Fire Protection (BFP) Sta Cruz assistant. " .
            "Your main role is to answer fire safety, prevention, and emergency questions. We have provided some local context below. " .
            "CRITICAL INSTRUCTION: If the provided context specifically answers the user's question, use it! " .
            "However, if the context is completely irrelevant to the user's specific question (e.g., they ask about interpreting the PASS method and the context only talks about calling 911), YOU MUST IGNORE THE CONTEXT. Do not force an irrelevant answer. Instead, use your own extensive, expert general knowledge about fire safety to answer the question elegantly and concisely. " .
            "Only if the user asks a completely unrelated question (like math, programming, or unrelated trivia) should you politely say that you only handle fire safety inquiries. " .
            "Use the provided BFP knowledge base context to answer the user's query. " .
            "If the answer is found in the context, synthesize it naturally. " .
            "If the answer is NOT in the context, but is a valid fire safety question, answer it safely using general fire safety knowledge. " .
            "Keep your responses concise and easy to read, as they may be spoken aloud via text-to-speech. " .
            "Never use markdown formatting like asterisks for bolding if it affects text-to-speech negatively (keep formatting simple).";

        $prompt = "Context (BFP Guidelines / Q&A):\n" . $relevantContext . "\n\n";

        // Inject conversation memory
        if ($request->has('history') && is_array($request->history)) {
            $prompt .= "--- RECENT CONVERSATION HISTORY ---\n";
            foreach ($request->input('history') as $msg) {
                $role = $msg['role'] === 'bot' ? 'Berong (You)' : 'User';
                $prompt .= "{$role}: {$msg['text']}\n";
            }
            $prompt .= "-----------------------------------\n\n";
        }

        $prompt .= "User's Current Question: " . $userMessage;

        $maxRetries = 2;
        $lastException = null;

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                $response = Http::timeout(30)->withoutVerifying()->withHeaders([
                    'Content-Type' => 'application/json',
                ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={$apiKey}", [
                    'system_instruction' => [
                        'parts' => [
                            ['text' => $systemPrompt]
                        ]
                    ],
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.5,
                        'maxOutputTokens' => 1000,
                    ]
                ]);

                if ($response->successful()) {
                    $data = $response->json();

                    if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                        $aiText = $data['candidates'][0]['content']['parts'][0]['text'];
                        return response()->json(['response' => $aiText]);
                    }
                }

                // If we get a 503 (overloaded), retry after a brief pause
                if ($response->status() === 503 && $attempt < $maxRetries) {
                    Log::warning("Gemini API 503 on attempt {$attempt}, retrying...");
                    usleep(500000); // 0.5s pause
                    continue;
                }

                Log::error("Gemini API Error (attempt {$attempt}): " . $response->body());

                $errorMessage = "I apologize, but I'm having trouble connecting to my knowledge base right now. For immediate emergencies, please dial 911 or your local BFP hotline immediately.";

                if ($response->status() === 503) {
                    $errorMessage = "I'm sorry, my AI processing servers are currently overloaded. Please wait a few moments and try your question again.";
                }

                return response()->json([
                    'response' => $errorMessage,
                    'error' => true
                ]);

            } catch (\Exception $e) {
                $lastException = $e;
                if ($attempt < $maxRetries) {
                    Log::warning("ChatbotController retry {$attempt}: " . $e->getMessage());
                    usleep(500000);
                    continue;
                }
            }
        }

        Log::error('ChatbotController failed after retries: ' . ($lastException ? $lastException->getMessage() : 'unknown'));
        return response()->json([
            'response' => "I apologize, I encountered a temporary connection issue. Please try again in a moment.",
            'error' => true
        ]);
    }

    public function generateSpeech(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'voice' => 'sometimes|string'
        ]);

        $apiKey = env('ELEVENLABS_API_KEY');

        if (empty($apiKey)) {
            return response()->json(['error' => 'ElevenLabs API key missing'], 500);
        }

        $text = $request->input('text');
        // Clean text (remove markdown for better speech)
        $cleanText = preg_replace('/[*#_`]/', '', $text);
        
        // "Antoni" voice ID (a natural male voice). 
        // You can browse other voices and get their IDs in your ElevenLabs dashboard.
        $voiceId = $request->input('voice', '1CkEF8EejhtlF4pZv178'); 

        $response = Http::withHeaders([
                'xi-api-key' => $apiKey,
            ])
            ->withoutVerifying()
            ->timeout(30)
            ->post("https://api.elevenlabs.io/v1/text-to-speech/{$voiceId}", [
                'text' => $cleanText,
                'model_id' => 'eleven_multilingual_v2', // Multilingual model is highly realistic
                'voice_settings' => [
                    'stability' => 0.5,
                    'similarity_boost' => 0.75
                ]
            ]);

        if ($response->successful()) {
            return response($response->body(), 200, [
                'Content-Type' => 'audio/mpeg',
            ]);
        }

        Log::error("ElevenLabs TTS Error: " . $response->body());
        return response()->json(['error' => 'Failed to generate speech'], 500);
    }

    /**
     * A simple local RAG search algorithm.
     * Reads the dataset, scores each row based on keyword matches with the user message,
     * and returns the top matches as a text block.
     */
    private function searchDataset(string $query, int $limit = 5): string
    {
        $csvPath = base_path('bfp_fire_safety_dataset_1200.csv');
        if (!file_exists($csvPath)) {
            Log::warning("BFP Dataset not found at " . $csvPath);
            return "No specific BFP context available.";
        }

        // Clean user query to base keywords, excluding STOP WORDS that pollute the search
        $stopWords = ['what', 'when', 'where', 'how', 'why', 'who', 'is', 'the', 'a', 'an', 'and', 'or', 'do', 'does', 'did', 'method', 'methods', 'fire', 'safety', 'for', 'to', 'in', 'of', 'on', 'with', 'about', 'should', 'can', 'will', 'would', 'could', 'if', 'see', 'saw', 'my', 'your', 'i', 'me', 'you', 'out', 'put', 'it'];
        $queryWords = array_filter(
            explode(' ', preg_replace('/[^a-zA-Z0-9\s]/', '', strtolower($query))),
            fn($w) => strlen($w) > 2 && !in_array($w, $stopWords)
        );

        if (empty($queryWords)) {
            return "No specific context. Rely on general fire safety knowledge.";
        }

        // Cache the parsed CSV data so we don't read the file from disk on every chat message
        $dataset = \Illuminate\Support\Facades\Cache::rememberForever('bfp_csv_dataset', function () use ($csvPath) {
            $rows = [];
            $handle = fopen($csvPath, "r");
            $headers = fgetcsv($handle);
            while (($data = fgetcsv($handle)) !== FALSE) {
                if (count($data) < 7) continue;
                $rows[] = [
                    'question' => strtolower($data[5]),
                    'answer' => $data[6],
                    'category' => strtolower($data[1]),
                    'subcategory' => strtolower($data[2]),
                    'text' => "Q: " . $data[5] . "\nA: " . $data[6]
                ];
            }
            fclose($handle);
            return $rows;
        });

        $scores = [];
        foreach ($dataset as $row) {
            $score = 0;
            foreach ($queryWords as $word) {
                if (str_contains($row['question'], $word)) $score += 3;
                if (str_contains(strtolower($row['answer']), $word)) $score += 1;
                if (str_contains($row['category'], $word) || str_contains($row['subcategory'], $word)) $score += 2;
            }
            if ($score > 0) {
                $scores[] = [
                    'score' => $score,
                    'text' => $row['text']
                ];
            }
        }

        // Sort by highest score first
        usort($scores, fn($a, $b) => $b['score'] <=> $a['score']);

        // Take top N
        $topMatches = array_slice($scores, 0, $limit);

        if (empty($topMatches)) {
            return "No exact match found in dataset. Rely on general fire safety knowledge.";
        }

        $contextString = "";
        foreach ($topMatches as $match) {
            $contextString .= $match['text'] . "\n\n";
        }

        return $contextString;
    }
}
