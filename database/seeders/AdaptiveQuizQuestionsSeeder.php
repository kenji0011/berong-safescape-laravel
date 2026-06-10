<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdaptiveQuizQuestionsSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('assessment_questions')->where('type', 'moduleQuiz')->delete();
        Schema::enableForeignKeyConstraints();

        $questions = [

            // ==========================================
            // MODULE 1: What Makes a Fire? (Fire Basics)
            // ==========================================
            // EASY 
            ['q' => 'What are the three things fire needs to burn (The Fire Triangle)?', 'o' => ['Heat, Fuel, Oxygen', 'Wood, Water, Air', 'Smoke, Ash, Sparks'], 'a' => 0, 'd' => 'Easy', 'c' => 'Fire Basics', 'e' => 'The Fire Triangle requires heat, fuel, and oxygen to exist.'],
            ['q' => 'Why are matches and lighters considered \'tools\' and not toys?', 'o' => ['They are too expensive for kids', 'They create heat and can start dangerous fires', 'Only teachers are allowed to use them'], 'a' => 1, 'd' => 'Easy', 'c' => 'Fire Basics', 'e' => 'They produce heat/sparks that can easily ignite a fire.'],
            ['q' => 'What should you do if you find matches or a lighter?', 'o' => ['Hide them in your bag', 'Try to light them carefully', 'Do not touch them and tell a grown-up right away'], 'a' => 2, 'd' => 'Easy', 'c' => 'Fire Basics', 'e' => 'An adult must safely secure them to prevent accidental fires.'],
            ['q' => 'What happens to a fire if you take away one part of the Fire Triangle?', 'o' => ['It gets bigger', 'It goes out', 'It changes color'], 'a' => 1, 'd' => 'Easy', 'c' => 'Fire Basics', 'e' => 'Fire cannot survive if any of the three elements is removed.'],
            ['q' => 'Which of these is an example of \'Fuel\' in the Fire Triangle?', 'o' => ['A spark from a lighter', 'The wind blowing', 'Paper, wood, or cloth'], 'a' => 2, 'd' => 'Easy', 'c' => 'Fire Basics', 'e' => 'Fuel is anything that can physically burn.'],
            // MEDIUM
            ['q' => 'How does pouring cold water on a fire put it out?', 'o' => ['It removes Heat', 'It removes Fuel', 'It removes Oxygen'], 'a' => 0, 'd' => 'Medium', 'c' => 'Fire Basics', 'e' => 'Water cools the fuel below its ignition temperature.'],
            ['q' => 'Why is a lighter dangerous to play with?', 'o' => ['It is too heavy', 'It makes a spark (Heat)', 'It breaks easily'], 'a' => 1, 'd' => 'Medium', 'c' => 'Fire Basics', 'e' => 'Lighters are ignition sources.'],
            ['q' => 'What is the safest action if you see matches on a table?', 'o' => ['Throw them away yourself', 'Tell an adult to move them', 'Hide them under a cushion'], 'a' => 1, 'd' => 'Medium', 'c' => 'Fire Basics', 'e' => 'Never handle them yourself; inform an adult.'],
            ['q' => 'Why won\'t a pile of dry wood burn without a lighter?', 'o' => ['No Fuel', 'No Heat (Spark)', 'No Oxygen'], 'a' => 1, 'd' => 'Medium', 'c' => 'Fire Basics', 'e' => 'Without an initial heat source, the fuel will not ignite.'],
            ['q' => 'What does a tiny spark use as \'Fuel\' to spread in a house?', 'o' => ['Water and air', 'Furniture, cloth, and curtains', 'Glass and metal'], 'a' => 1, 'd' => 'Medium', 'c' => 'Fire Basics', 'e' => 'Household items serve as fuel.'],
            // HARD
            ['q' => 'Why does closing a fireplace door tightly lower the fire?', 'o' => ['It cuts off Fuel', 'It cuts off Oxygen', 'It removes Heat'], 'a' => 1, 'd' => 'Hard', 'c' => 'Fire Basics', 'e' => 'Closing the doors blocks the oxygen the fire needs.'],
            ['q' => 'Who is safely allowed to use tools like matches?', 'o' => ['Only trained adults', 'Older kids', 'Anyone'], 'a' => 0, 'd' => 'Hard', 'c' => 'Fire Basics', 'e' => 'Matches are tools meant only for responsible adults.'],
            ['q' => 'Why must you tell an adult right away if you find matches?', 'o' => ['So you get a reward', 'So they can punish whoever left them', 'So they can safely put them away'], 'a' => 2, 'd' => 'Hard', 'c' => 'Fire Basics', 'e' => 'Leaving them out is a danger to others.'],
            ['q' => 'How does thick foam put out a chemical fire?', 'o' => ['It freezes the fire', 'It acts like a blanket to block oxygen', 'It destroys the fuel'], 'a' => 1, 'd' => 'Hard', 'c' => 'Fire Basics', 'e' => 'Foam acts like a blanket that blocks oxygen.'],
            ['q' => 'Why do dry leaves catch fire from a spark but a metal table won\'t?', 'o' => ['Dry leaves are better fuel', 'Metal is too cold', 'There is no air near metal'], 'a' => 0, 'd' => 'Hard', 'c' => 'Fire Basics', 'e' => 'Metal does not catch fire easily.'],

            // ==========================================
            // MODULE 2: Listen, Line Up, Lead (Emergency Response)
            // ==========================================
            // EASY 
            ['q' => 'What should you do if your buddy is missing during a school fire drill?', 'o' => ['Tell your teacher immediately', 'Run back inside to search for them', 'Hide under a desk until they return'], 'a' => 0, 'd' => 'Easy', 'c' => 'Emergency Response', 'e' => 'Teachers need to know immediately so firefighters can safely search for them.'],
            ['q' => 'What should you do immediately after safely escaping a burning school building?', 'o' => ['Run around and watch the fire', 'Go directly to the designated Safe Meeting Place', 'Go home or walk to the playground'], 'a' => 1, 'd' => 'Easy', 'c' => 'Emergency Response', 'e' => 'The Safe Meeting Place ensures everyone is counted and safe.'],
            ['q' => 'How is a School Fire Alarm different from a Recess Bell?', 'o' => ['It is quieter', 'It rings continuously (Long Ring)', 'It sounds like a piano'], 'a' => 1, 'd' => 'Easy', 'c' => 'Emergency Response', 'e' => 'A continuous long ring is the signal for a fire emergency.'],
            ['q' => 'What does the Red Box (Manual Call Point) do?', 'o' => ['Calls the janitor', 'Triggers the alarm for the whole school', 'Opens the door'], 'a' => 1, 'd' => 'Easy', 'c' => 'Emergency Response', 'e' => 'Pressing the manual call point warns everyone in the building.'],
            ['q' => 'Why do we WALK instead of RUN during a fire drill?', 'o' => ['To prevent panic and accidents', 'To let the fire catch up', 'Because running is tiring'], 'a' => 0, 'd' => 'Easy', 'c' => 'Emergency Response', 'e' => 'Walking calmly prevents people from tripping and getting hurt.'],
            // MEDIUM
            ['q' => 'What is the main purpose of the Buddy System?', 'o' => ['To walk faster', 'To quickly check if someone is missing', 'To look neat in line'], 'a' => 1, 'd' => 'Medium', 'c' => 'Emergency Response', 'e' => 'It ensures no one is left behind.'],
            ['q' => 'Why go directly to the Safe Meeting Place?', 'o' => ['To watch firefighters', 'To wait for parents', 'So teachers can count everyone'], 'a' => 2, 'd' => 'Medium', 'c' => 'Emergency Response', 'e' => 'Accountability is crucial.'],
            ['q' => 'What is the first thing you do when the alarm rings?', 'o' => ['Run outside', 'Look for friends', 'Stop, listen, and line up'], 'a' => 2, 'd' => 'Medium', 'c' => 'Emergency Response', 'e' => 'Following instructions ensures a safe evacuation.'],
            ['q' => 'When is the ONLY time you press the Red Box?', 'o' => ['During recess', 'Only for real fire emergencies', 'To test the alarm'], 'a' => 1, 'd' => 'Medium', 'c' => 'Emergency Response', 'e' => 'It is strictly for real emergencies.'],
            ['q' => 'Why is walking calmly better than running?', 'o' => ['Saves energy', 'Prevents dangerous tripping pile-ups', 'Looks nicer'], 'a' => 1, 'd' => 'Medium', 'c' => 'Emergency Response', 'e' => 'Stampedes block exits.'],
            // HARD
            ['q' => 'What if your buddy runs back inside the building?', 'o' => ['Follow them', 'Hide outside', 'Stay outside and tell a teacher'], 'a' => 2, 'd' => 'Hard', 'c' => 'Emergency Response', 'e' => 'Never go back inside a burning building.'],
            ['q' => 'Can you run back inside for your favorite backpack?', 'o' => ['Yes, if you are fast', 'Never step back inside', 'Ask a teacher to get it'], 'a' => 1, 'd' => 'Hard', 'c' => 'Emergency Response', 'e' => 'Once you escape, never go back inside!'],
            ['q' => 'How can you trigger the alarm if smoke detectors fail?', 'o' => ['Yell loudly', 'Use the Red Alarm Box on the wall', 'Call the police'], 'a' => 1, 'd' => 'Hard', 'c' => 'Emergency Response', 'e' => 'You can pull the red fire alarm box on the wall.'],
            ['q' => 'Why is pulling the alarm as a prank a serious crime?', 'o' => ['It is a funny joke', 'It breaks the alarm', 'It takes firefighters away from real emergencies'], 'a' => 2, 'd' => 'Hard', 'c' => 'Emergency Response', 'e' => 'It distracts firefighters from real emergencies.'],
            ['q' => 'Why is panicking in a smoky hallway so dangerous?', 'o' => ['It is against rules', 'It feeds the fire', 'It makes you breathe in more poisonous smoke'], 'a' => 2, 'd' => 'Hard', 'c' => 'Emergency Response', 'e' => 'Panicking makes you breathe in more poisonous smoke.'],

            // ==========================================
            // MODULE 3: The Escape Plan (Smoke Detector Knowledge & Evacuation)
            // ==========================================
            // EASY
            ['q' => 'How many escape routes should you know for every room?', 'o' => ['Just one', 'Two (Door & Window)', 'None'], 'a' => 1, 'd' => 'Easy', 'c' => 'Smoke Detector Knowledge', 'e' => 'Always have a primary route and a backup route.'],
            ['q' => 'What part of your hand do you use to check a door?', 'o' => ['The palm', 'The fingertips', 'The back of the hand'], 'a' => 2, 'd' => 'Easy', 'c' => 'Smoke Detector Knowledge', 'e' => 'The back of the hand is sensitive to heat and protects your palms for crawling.'],
            ['q' => 'If the door is HOT, what do you do?', 'o' => ['Open it anyway', 'Do not open it. Find another way.', 'Kick it down'], 'a' => 1, 'd' => 'Easy', 'c' => 'Smoke Detector Knowledge', 'e' => 'A hot door means fire is right outside. Use your backup escape route.'],
            ['q' => 'What is the \'Meeting Spot\'?', 'o' => ['A place inside the kitchen', 'A safe place outside where family gathers', 'The roof'], 'a' => 1, 'd' => 'Easy', 'c' => 'Smoke Detector Knowledge', 'e' => 'A meeting spot ensures everyone is safely out and accounted for.'],
            ['q' => 'The \'Golden Rule\' of evacuation integrity is:', 'o' => ['Once you are out, STAY OUT', 'Go back inside for pets', 'Run back for your phone'], 'a' => 0, 'd' => 'Easy', 'c' => 'Smoke Detector Knowledge', 'e' => 'Never go back inside a burning building for any reason.'],
            // MEDIUM 
            ['q' => 'What if your main door is blocked by thick smoke?', 'o' => ['Run through it', 'Wait for it to clear', 'Reroute and use your backup plan'], 'a' => 2, 'd' => 'Medium', 'c' => 'Smoke Detector Knowledge', 'e' => 'Never try to pass through thick smoke.'],
            ['q' => 'What two parts of the door should you check for heat?', 'o' => ['The door and the doorknob', 'The hinges and frame', 'The top and bottom'], 'a' => 0, 'd' => 'Medium', 'c' => 'Smoke Detector Knowledge', 'e' => 'Heat transfers through wood and metal.'],
            ['q' => 'Why should you open a cool door very slowly?', 'o' => ['To be quiet', 'So it doesn\'t break', 'To be ready to shut it if smoke rushes in'], 'a' => 2, 'd' => 'Medium', 'c' => 'Smoke Detector Knowledge', 'e' => 'Smoke can build up silently.'],
            ['q' => 'Why are messy toys dangerous during a fire?', 'o' => ['They look bad', 'They are trip hazards in the dark smoke', 'They might burn'], 'a' => 1, 'd' => 'Medium', 'c' => 'Smoke Detector Knowledge', 'e' => 'Keep a clear path for safe escape.'],
            ['q' => 'Who rescues a pet trapped inside the house?', 'o' => ['You run back', 'Only trained firefighters', 'A parent'], 'a' => 1, 'd' => 'Medium', 'c' => 'Smoke Detector Knowledge', 'e' => 'Never re-enter. Firefighters have oxygen gear.'],
            // HARD 
            ['q' => 'What helps you escape safely from a 2nd-story window?', 'o' => ['A rope', 'A trampoline', 'A fire escape ladder'], 'a' => 2, 'd' => 'Hard', 'c' => 'Smoke Detector Knowledge', 'e' => 'Escape ladders help you climb down safely.'],
            ['q' => 'If the wood door feels cool but the metal knob feels warm:', 'o' => ['Do not open it, fire is nearby', 'Open it quickly', 'It is just absorbing light'], 'a' => 0, 'd' => 'Hard', 'c' => 'Smoke Detector Knowledge', 'e' => 'Metal gets hot much faster than wood.'],
            ['q' => 'Why crawl 12 to 24 inches above the floor?', 'o' => ['It is faster', 'It keeps clothes clean', 'That is where the clean air is'], 'a' => 2, 'd' => 'Hard', 'c' => 'Smoke Detector Knowledge', 'e' => 'Poisonous smoke rises to the ceiling.'],
            ['q' => 'Why use a specific Meeting Spot landmark like a tree?', 'o' => ['To stay in the shade', 'So family members can find each other easily', 'It is a school rule'], 'a' => 1, 'd' => 'Hard', 'c' => 'Smoke Detector Knowledge', 'e' => 'A clear landmark helps families find each other quickly.'],
            ['q' => 'Why is "Once out, stay out" an absolute rule?', 'o' => ['Poisonous smoke can overwhelm you very quickly', 'The police will stop you', 'The building will instantly collapse'], 'a' => 0, 'd' => 'Hard', 'c' => 'Smoke Detector Knowledge', 'e' => 'Poisonous smoke can overwhelm you very quickly.'],

            // ==========================================
            // MODULE 4: Get Low and Go! (Evacuation Planning)
            // ==========================================
            // EASY
            ['q' => 'Smoke is heavy, so it sinks to the floor.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Easy', 'c' => 'Evacuation Planning', 'e' => 'False! Hot smoke is lighter than air and rises rapidly to the ceiling.'],
            ['q' => 'Most fire injuries come from smoke, not flames.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Easy', 'c' => 'Evacuation Planning', 'e' => 'True! Toxic smoke causes far more injuries than the flames themselves.'],
            ['q' => 'You should crawl on your hands and knees through smoke.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Easy', 'c' => 'Evacuation Planning', 'e' => 'True! Crawling keeps your head in the clean air zone near the floor.'],
            ['q' => 'Real smoke looks grey like in the movies.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Easy', 'c' => 'Evacuation Planning', 'e' => 'False! Real house fire smoke is completely pitch black.'],
            ['q' => 'Covering your nose with your shirt can help filter some particles.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Easy', 'c' => 'Evacuation Planning', 'e' => 'True! A cloth can act as a basic filter against large soot particles.'],
            // MEDIUM 
            ['q' => 'The safe "Green Zone" of air is 1 to 2 feet off the ground.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Medium', 'c' => 'Evacuation Planning', 'e' => 'True! Stay low to survive.'],
            ['q' => 'Toxic gases in smoke can knock you out instantly.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Medium', 'c' => 'Evacuation Planning', 'e' => 'True! Poisonous gases are the primary danger.'],
            ['q' => 'Slithering on your belly is the best way to escape.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Medium', 'c' => 'Evacuation Planning', 'e' => 'False! Crawling on hands and knees is faster.'],
            ['q' => 'Getting low helps you see the floorboards better.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Medium', 'c' => 'Evacuation Planning', 'e' => 'True! Visibility is best near the floor.'],
            ['q' => 'You should spend time looking for a wet towel before escaping.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Medium', 'c' => 'Evacuation Planning', 'e' => 'False! Use your shirt and go immediately.'],
            // HARD 
            ['q' => 'Hot air rises because heat makes air lighter.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Hard', 'c' => 'Evacuation Planning', 'e' => 'True! This is why dangerous smoke gathers near the ceiling.'],
            ['q' => 'Taking one deep breath of smoke is perfectly safe.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Hard', 'c' => 'Evacuation Planning', 'e' => 'False! Breathing it even once can cause immediate harm.'],
            ['q' => 'If you can\'t see in the smoke, stand up quickly.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Hard', 'c' => 'Evacuation Planning', 'e' => 'False! Stay low and feel the walls to find your way.'],
            ['q' => 'Keep your head pointing straight down at the floor when crawling.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Hard', 'c' => 'Evacuation Planning', 'e' => 'False! Keep your head up slightly so you can see where you are going.'],
            ['q' => 'A shirt blocks 100% of all poisonous fire gases.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Hard', 'c' => 'Evacuation Planning', 'e' => 'False! It blocks ash, but not poisonous gases.'],

            // ==========================================
            // MODULE 5: The Final Exam (Comprehensive)
            // ==========================================
            // EASY
            ['q' => 'What 3 things make up the Fire Triangle?', 'o' => ['Heat, Fuel, Oxygen', 'Wood, Matches, Air', 'Water, Wind, Earth'], 'a' => 0, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Fire needs all three to burn.'],
            ['q' => 'Matches and lighters are:', 'o' => ['Toys for fun', 'Tools for adults', 'Candy'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Never play with tools that make fire.'],
            ['q' => 'If you take away Oxygen, the fire:', 'o' => ['Gets bigger', 'Goes out', 'Turns blue'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'A fire cannot survive without oxygen.'],
            ['q' => 'What sound does a Fire Alarm usually make?', 'o' => ['Short bell ring', 'Dog barking', 'Continuous long ring/siren'], 'a' => 2, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'A continuous siren means evacuate.'],
            ['q' => 'What is the "Red Box" on the wall?', 'o' => ['First Aid', 'Manual Call Point', 'Candy dispenser'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Press it to trigger the fire alarm.'],
            ['q' => 'During a drill, you should:', 'o' => ['Run fast', 'Walk calmly', 'Hide'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Walking prevents accidents.'],
            ['q' => 'How many ways out should you know per room?', 'o' => ['1', '2', '3'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Always have a backup plan.'],
            ['q' => 'How do you check a closed door?', 'o' => ['Kick it', 'Palm of hand', 'Back of hand'], 'a' => 2, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'The back of the hand protects your palm.'],
            ['q' => 'If the door is HOT, you should:', 'o' => ['Open it', 'Use the window', 'Wait'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Hot means fire is outside. Use the backup route.'],
            ['q' => 'Smoke is dangerous because:', 'o' => ['It smells bad', 'It is toxic and hot', 'It is wet'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Smoke causes the most injuries.'],
            ['q' => 'Where is the cleanest air in a fire?', 'o' => ['Near the ceiling', 'In the middle', 'Low near the floor'], 'a' => 2, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Hot smoke rises, pushing clean air down.'],
            ['q' => 'How should you move through smoke?', 'o' => ['Run upright', 'Crawl on hands/knees', 'Slither on belly'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Keep your head low to breathe clean air.'],
            ['q' => 'If your clothes catch fire, you:', 'o' => ['Run', 'Stop, Drop, Roll', 'Scream'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Rolling smothers the flames.'],
            ['q' => 'A candle should be placed:', 'o' => ['Near curtains', 'Far from anything flammable', 'On a bed'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Keep fires away from fuel.'],
            ['q' => 'The most important rule after escaping is:', 'o' => ['Go back for pets', 'Stay Out', 'Take a selfie'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Once you are out, stay out!'],
            // MEDIUM
            ['q' => 'Why does a fire need oxygen?', 'o' => ['To cool down', 'To change colors', 'To fuel the chemical reaction'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Oxygen fuels the chemical reaction.'],
            ['q' => 'Why shouldn\'t kids play with matches?', 'o' => ['They are heavy', 'They break easily', 'A tiny spark can start a big fire'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Even a tiny spark causes massive damage.'],
            ['q' => 'How does water put out a fire?', 'o' => ['It removes oxygen', 'It breaks wood', 'It cools the fuel down'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Water drastically lowers the temperature.'],
            ['q' => 'Why is the fire alarm a continuous ring?', 'o' => ['It is quiet', 'To sound different from a recess bell', 'It is easier to build'], 'a' => 1, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Emergency signals must be distinct.'],
            ['q' => 'When do you press the Red Box?', 'o' => ['To go home', 'To test it', 'Only for real fires'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'False alarms are dangerous.'],
            ['q' => 'Why is running during a drill bad?', 'o' => ['Wastes energy', 'Teacher gets mad', 'Causes dangerous stampedes'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Order is more important than raw speed.'],
            ['q' => 'Why do you need a backup escape route?', 'o' => ['Windows are faster', 'Fresh air', 'Primary door might be blocked'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Fires spread unpredictably.'],
            ['q' => 'Why check a door with the back of your hand?', 'o' => ['Palms are thick', 'School rule', 'Protects your palms for crawling'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'You need your palms to crawl.'],
            ['q' => 'What is the next step for a cool door?', 'o' => ['Kick it open', 'Run', 'Open very slowly'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Smoke can build up silently.'],
            ['q' => 'What makes smoke so dangerous?', 'o' => ['Hot oxygen', 'Water vapor', 'Toxic Carbon Monoxide'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Carbon Monoxide knocks you out quickly.'],
            ['q' => 'Why is clean air near the floor?', 'o' => ['Floor absorbs smoke', 'Smoke is heavier', 'Hot toxic smoke rises up'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Hot air expands and rises.'],
            ['q' => 'Why shouldn\'t you slither on your belly?', 'o' => ['Can\'t see', 'Gets you dirty', 'Crawling is much faster'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Crawling is the perfect balance of speed.'],
            ['q' => 'Why is running bad if your clothes catch fire?', 'o' => ['You might trip', 'Ruins shoes', 'It feeds the flames oxygen'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Running acts like a fan on the flames.'],
            ['q' => 'How far should objects be from a space heater?', 'o' => ['Touching it', '1 foot', 'At least 3 feet'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Heaters can ignite nearby fuel sources.'],
            ['q' => 'Who rescues pets trapped in a fire?', 'o' => ['You', 'Parents', 'Trained firefighters'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Never re-enter a burning building.'],
            // HARD
            ['q' => 'What happens when you remove \'Heat\' from a fire?', 'o' => ['It changes color', 'It goes out completely', 'It spreads'], 'a' => 1, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Removing any one part will stop the fire.'],
            ['q' => 'Why is an unattended candle dangerous?', 'o' => ['Made of wax', 'Creates smoke', 'The open flame can easily start a fire'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'An unattended open flame can easily start a fire.'],
            ['q' => 'Why use foam on chemical fires?', 'o' => ['It\'s cheaper', 'Cools it down', 'It acts like a blanket to block oxygen'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Foam acts like a blanket to block oxygen.'],
            ['q' => 'What if the school alarm loses power?', 'o' => ['It stops', 'Must yell', 'Backup batteries keep it working'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Safety systems have backup batteries.'],
            ['q' => 'Why are false alarms highly illegal?', 'o' => ['Loud', 'Breaks switch', 'Takes firefighters away from real emergencies'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'It takes firefighters away from real emergencies.'],
            ['q' => 'How does walking prevent smoke inhalation?', 'o' => ['Saves oxygen', 'Keeps air still', 'Prevents heavy breathing of poisonous smoke'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Panicking makes you breathe in more poisonous smoke.'],
            ['q' => 'What tool helps escape a 2nd-story window?', 'o' => ['Trampoline', 'Mattress', 'Escape ladder'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Escape ladders help you climb down safely.'],
            ['q' => 'What does a warm metal knob mean?', 'o' => ['Warm room', 'Broken door', 'Intense heat on the other side'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Metal gets extremely hot very quickly.'],
            ['q' => 'Why is a hot door dangerous to open?', 'o' => ['Wind', 'Fire pulls it', 'The pressure from the fire could force the door open'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'The pressure from the fire could force the door open.'],
            ['q' => 'Why is Carbon Monoxide so deadly?', 'o' => ['Burns lungs', 'Makes you cough', 'It is invisible and replaces your oxygen'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'It is an invisible, odorless, and poisonous gas.'],
            ['q' => 'The boundary between black smoke and cool air is called:', 'o' => ['Smoke wall', 'Gravity separation', 'The smoke layer'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'This creates a clear zone of air near the floor.'],
            ['q' => 'How do you navigate in thick, dark smoke?', 'o' => ['Crawl fast', 'Find light', 'Feel and follow the wall'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Following a wall ensures you will eventually find a door.'],
            ['q' => 'How does \'Roll\' in Stop, Drop, and Roll work?', 'o' => ['Cools you down', 'Shakes off fire', 'Smothers the flames by blocking oxygen'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Rolling smothers the flames by blocking oxygen.'],
            ['q' => 'How do you prevent electrical fires?', 'o' => ['No electricity at night', 'Slow switches', 'Don\'t plug too many things into one outlet'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Plugging in too many things can overheat the wires.'],
            ['q' => 'Why do firefighters enforce \'Once out, stay out\'?', 'o' => ['Police rule', 'Building collapse', 'Fires can spread rapidly and trap you'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Fires can spread rapidly and trap you unexpectedly.']

        ];

        // Ensure we assign `type = moduleQuiz` and encode `forRoles`
        foreach ($questions as $q) {
            DB::table('assessment_questions')->insert([
                'question' => $q['q'],
                'options' => json_encode($q['o']),
                'correctAnswer' => $q['a'],
                'explanation' => $q['e'],
                'category' => $q['c'], // Acts as module association
                'difficulty' => $q['d'],
                'forRoles' => json_encode(['kid']),
                'type' => 'moduleQuiz', // Specific to adaptive learning modules!
                'isActive' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
