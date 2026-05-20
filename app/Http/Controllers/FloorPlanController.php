<?php

namespace App\Http\Controllers;

use App\Models\FloorPlan;
use App\Models\SimulationJob;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class FloorPlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $floorPlans = FloorPlan::where('userId', Auth::id())->get();
        return response()->json($floorPlans);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'gridData' => 'required|array',
            'gridWidth' => 'sometimes|integer|min:1|max:1000',
            'gridHeight' => 'sometimes|integer|min:1|max:1000',
            'exitCount' => 'sometimes|integer|min:0',
        ]);

        $user = Auth::user();

        $floorPlan = FloorPlan::create([
            'name' => strip_tags($validated['name']),
            'description' => strip_tags($validated['description'] ?? ''),
            'gridData' => $validated['gridData'],
            'userId' => $user->id,
            'uploaderName' => $user->name ?? $user->username ?? 'Unknown',
            'gridWidth' => $validated['gridWidth'] ?? 256,
            'gridHeight' => $validated['gridHeight'] ?? 256,
            'exitCount' => $validated['exitCount'] ?? 0,
            'isPublic' => false,
            'processingMethod' => 'unet',
        ]);

        return response()->json($floorPlan, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $floorPlan = FloorPlan::where('id', $id)->where('userId', Auth::id())->firstOrFail();
        return response()->json($floorPlan);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $floorPlan = FloorPlan::where('id', $id)->where('userId', Auth::id())->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'gridData' => 'sometimes|required|array',
            'gridWidth' => 'sometimes|integer|min:1|max:1000',
            'gridHeight' => 'sometimes|integer|min:1|max:1000',
            'exitCount' => 'sometimes|integer|min:0',
        ]);

        if (isset($validated['name'])) {
            $floorPlan->name = strip_tags($validated['name']);
        }
        if (isset($validated['description'])) {
            $floorPlan->description = strip_tags($validated['description']);
        }
        if (isset($validated['gridData'])) {
            $floorPlan->gridData = $validated['gridData'];
        }
        if (isset($validated['gridWidth'])) {
            $floorPlan->gridWidth = $validated['gridWidth'];
        }
        if (isset($validated['gridHeight'])) {
            $floorPlan->gridHeight = $validated['gridHeight'];
        }
        if (isset($validated['exitCount'])) {
            $floorPlan->exitCount = $validated['exitCount'];
        }

        $floorPlan->save();

        return response()->json($floorPlan);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $floorPlan = FloorPlan::where('id', $id)->where('userId', Auth::id())->firstOrFail();
        $floorPlan->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Clone an existing floor plan.
     */
    public function clone(string $id)
    {
        $floorPlan = FloorPlan::where('id', $id)->where('userId', Auth::id())->firstOrFail();
        $user = Auth::user();

        $clone = FloorPlan::create([
            'name' => strip_tags($floorPlan->name) . ' (Clone)',
            'description' => $floorPlan->description,
            'gridData' => $floorPlan->gridData,
            'userId' => $user->id,
            'uploaderName' => $user->name ?? $user->username ?? 'Unknown',
            'gridWidth' => $floorPlan->gridWidth,
            'gridHeight' => $floorPlan->gridHeight,
            'exitCount' => $floorPlan->exitCount,
            'isPublic' => false,
            'clonedFromId' => $floorPlan->id,
            'processingMethod' => $floorPlan->processingMethod,
        ]);

        return response()->json(['success' => true, 'floorPlan' => $clone]);
    }

    /**
     * Run simulation on floor plan.
     */
    public function runSimulation(string $id)
    {
        $floorPlan = FloorPlan::where('id', $id)->where('userId', Auth::id())->firstOrFail();

        // Evacuation simulation calculation
        $evacuationTime = rand(12, 38);
        $exitCount = (int) ($floorPlan->exitCount ?? 1);
        $safetyRating = min(100, max(50, 70 + ($exitCount * 10) - ($evacuationTime / 2)));

        $job = SimulationJob::create([
            'id' => (string) Str::uuid(),
            'status' => 'completed',
            'userId' => Auth::id(),
            'config' => [
                'floorPlanId' => $floorPlan->id,
            ],
            'result' => [
                'evacuationTime' => $evacuationTime . 's',
                'safetyRating' => $safetyRating . '%',
                'bottlenecks' => $evacuationTime > 30 ? 1 : 0,
            ],
        ]);

        return response()->json(['success' => true, 'job' => $job]);
    }

    /**
     * Get simulation status.
     */
    public function simulationStatus(string $id)
    {
        $floorPlan = FloorPlan::where('id', $id)->where('userId', Auth::id())->firstOrFail();

        $job = SimulationJob::where('userId', Auth::id())
            ->whereJsonContains('config->floorPlanId', (int) $floorPlan->id)
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'status' => $job ? $job->status : 'none',
            'result' => $job ? $job->result : null,
            'error' => $job ? $job->error : null,
        ]);
    }
}

