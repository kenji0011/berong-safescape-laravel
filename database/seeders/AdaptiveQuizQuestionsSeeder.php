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

            // MEDIUM (Parallel to Easy)
            ['q' => 'Which specific elements must combine to form the Fire Triangle?', 'o' => ['Heat, Fuel, Oxygen', 'Wood, Water, Wind', 'Light, Heat, Smoke'], 'a' => 0, 'd' => 'Medium', 'c' => 'Fire Basics', 'e' => 'The Fire Triangle requires heat, fuel, and oxygen to exist.'],
            ['q' => 'Why must you never play with matches and lighters?', 'o' => ['They provide the \'Heat\' to start a fire', 'They run out of fuel too quickly', 'They are expensive to replace'], 'a' => 0, 'd' => 'Medium', 'c' => 'Fire Basics', 'e' => 'They produce heat/sparks that can easily ignite a fire.'],
            ['q' => 'If you see a lighter on a table, what is the safest action?', 'o' => ['Throw it in the trash can', 'Put it in your pocket', 'Do not touch it and immediately notify an adult'], 'a' => 2, 'd' => 'Medium', 'c' => 'Fire Basics', 'e' => 'An adult must safely secure them to prevent accidental fires.'],
            ['q' => 'If a fire loses one of its three elements, what will happen?', 'o' => ['The fire will get hotter', 'The fire will extinguish and go out', 'The fire will create more fuel'], 'a' => 1, 'd' => 'Medium', 'c' => 'Fire Basics', 'e' => 'Fire cannot survive if any of the three elements is removed.'],
            ['q' => 'In the Fire Triangle, what do we call items like paper and wood?', 'o' => ['Oxygen', 'Fuel', 'Heat'], 'a' => 1, 'd' => 'Medium', 'c' => 'Fire Basics', 'e' => 'Fuel is anything that can physically burn.'],

            // HARD (Parallel to Easy)
            ['q' => 'Which of the following is NOT part of the Fire Triangle?', 'o' => ['Heat', 'Oxygen', 'Light'], 'a' => 2, 'd' => 'Hard', 'c' => 'Fire Basics', 'e' => 'Fire produces light, but it only needs Heat, Fuel, and Oxygen to exist.'],
            ['q' => 'How do matches and lighters act in the Fire Triangle?', 'o' => ['They provide the heat needed to ignite fuel', 'They melt and ruin the furniture', 'They consume all the oxygen instantly'], 'a' => 0, 'd' => 'Hard', 'c' => 'Fire Basics', 'e' => 'They produce heat/sparks that can easily ignite a fire.'],
            ['q' => 'Why must you leave a found lighter alone and tell an adult?', 'o' => ['It might be hot and burn your hand', 'Only adults should handle tools that create heat', 'It belongs to someone else'], 'a' => 1, 'd' => 'Hard', 'c' => 'Fire Basics', 'e' => 'An adult must safely secure them to prevent accidental fires.'],
            ['q' => 'To stop a fire, you must remove which of the following?', 'o' => ['Heat, Fuel, or Oxygen', 'Wood, Water, or Air', 'Smoke, Ash, or Sparks'], 'a' => 0, 'd' => 'Hard', 'c' => 'Fire Basics', 'e' => 'Fire cannot survive if any of the three elements is removed.'],
            ['q' => 'Which element of the Fire Triangle is something that can burn?', 'o' => ['The wind', 'Fuel (like paper, wood, or cloth)', 'The heat'], 'a' => 1, 'd' => 'Hard', 'c' => 'Fire Basics', 'e' => 'Fuel is anything that can physically burn.'],

            // ==========================================
            // MODULE 2: Listen, Line Up, Lead (Emergency Response)
            // ==========================================
            // EASY 
            ['q' => 'What should you do if your buddy is missing during a school fire drill?', 'o' => ['Tell your teacher immediately', 'Run back inside to search for them', 'Hide under a desk until they return'], 'a' => 0, 'd' => 'Easy', 'c' => 'Emergency Response', 'e' => 'Teachers need to know immediately so firefighters can safely search.'],
            ['q' => 'What should you do immediately after safely escaping a burning school building?', 'o' => ['Run around and watch the fire', 'Go directly to the designated Safe Meeting Place', 'Go home or walk to the playground'], 'a' => 1, 'd' => 'Easy', 'c' => 'Emergency Response', 'e' => 'The Safe Meeting Place ensures everyone is counted and safe.'],
            ['q' => 'How is a School Fire Alarm different from a Recess Bell?', 'o' => ['It is quieter', 'It rings continuously (Long Ring)', 'It sounds like a piano'], 'a' => 1, 'd' => 'Easy', 'c' => 'Emergency Response', 'e' => 'A continuous long ring is the signal for a fire emergency.'],
            ['q' => 'What does the Red Box (Manual Call Point) do?', 'o' => ['Calls the janitor', 'Triggers the alarm for the whole school', 'Opens the door'], 'a' => 1, 'd' => 'Easy', 'c' => 'Emergency Response', 'e' => 'Pressing the manual call point warns everyone in the building.'],
            ['q' => 'Why do we WALK instead of RUN during a fire drill?', 'o' => ['To prevent panic and accidents', 'To let the fire catch up', 'Because running is tiring'], 'a' => 0, 'd' => 'Easy', 'c' => 'Emergency Response', 'e' => 'Walking calmly prevents people from tripping and getting hurt.'],

            // MEDIUM (Parallel to Easy)
            ['q' => 'If your buddy is not with you during an evacuation, what is your first step?', 'o' => ['Notify your teacher immediately', 'Wait for them by the door', 'Go back to the classroom to check'], 'a' => 0, 'd' => 'Medium', 'c' => 'Emergency Response', 'e' => 'Teachers need to know immediately so firefighters can safely search.'],
            ['q' => 'What is the main purpose of the Safe Meeting Place outside?', 'o' => ['To have a place to eat snacks', 'To ensure every student is counted and safe', 'To watch the BFP fire trucks arrive'], 'a' => 1, 'd' => 'Medium', 'c' => 'Emergency Response', 'e' => 'The Safe Meeting Place ensures everyone is counted and safe.'],
            ['q' => 'How can you tell that a School Fire Alarm is sounding?', 'o' => ['It emits a continuous long ring', 'It rings three short times', 'It plays music'], 'a' => 0, 'd' => 'Medium', 'c' => 'Emergency Response', 'e' => 'A continuous long ring is the signal for a fire emergency.'],
            ['q' => 'What happens when the Red Box on the wall is pressed?', 'o' => ['It triggers the building\'s fire alarm system', 'It unlocks all the doors in the school', 'It sprays water on the fire'], 'a' => 0, 'd' => 'Medium', 'c' => 'Emergency Response', 'e' => 'Pressing the manual call point warns everyone in the building.'],
            ['q' => 'Why is it dangerous to run during a school fire drill?', 'o' => ['It makes too much noise', 'It can cause tripping, injuries, and block exits', 'It breaks the school rules'], 'a' => 1, 'd' => 'Medium', 'c' => 'Emergency Response', 'e' => 'Walking calmly prevents people from tripping and getting hurt.'],

            // HARD (Parallel to Easy)
            ['q' => 'During a fire drill, why report a missing buddy instead of searching?', 'o' => ['Only trained firefighters can safely search inside', 'You might get lost in the hallways', 'You will miss the attendance check'], 'a' => 0, 'd' => 'Hard', 'c' => 'Emergency Response', 'e' => 'Teachers need to know immediately so firefighters can safely search.'],
            ['q' => 'Why must you stay at the Safe Meeting Place until a teacher says so?', 'o' => ['Because you are not allowed to go home early', 'To ensure everyone is accounted for safely', 'Because the grass is the safest place to sit'], 'a' => 1, 'd' => 'Hard', 'c' => 'Emergency Response', 'e' => 'The Safe Meeting Place ensures everyone is counted and safe.'],
            ['q' => 'A continuous long ringing sound at school indicates what?', 'o' => ['A fire emergency requiring immediate evacuation', 'The end of the school day', 'A lockdown drill'], 'a' => 0, 'd' => 'Hard', 'c' => 'Emergency Response', 'e' => 'A continuous long ring is the signal for a fire emergency.'],
            ['q' => 'When is the only time you should press the Red Box on the wall?', 'o' => ['When you are late for class', 'When there is an actual fire or thick smoke', 'When you want to test if it works'], 'a' => 1, 'd' => 'Hard', 'c' => 'Emergency Response', 'e' => 'Pressing the manual call point warns everyone in the building.'],
            ['q' => 'What causes the most injuries during an emergency evacuation?', 'o' => ['People panicking and running to the exits', 'People forgetting their backpacks', 'People walking too slowly'], 'a' => 0, 'd' => 'Hard', 'c' => 'Emergency Response', 'e' => 'Walking calmly prevents people from tripping and getting hurt.'],

            // ==========================================
            // MODULE 3: The Escape Plan (Smoke Detector Knowledge & Evacuation)
            // ==========================================
            // EASY
            ['q' => 'How many escape routes should you know for every room?', 'o' => ['Just one', 'Two (Door & Window)', 'None'], 'a' => 1, 'd' => 'Easy', 'c' => 'Smoke Detector Knowledge', 'e' => 'Always have a primary route and a backup route.'],
            ['q' => 'What part of your hand do you use to check a door?', 'o' => ['The palm', 'The fingertips', 'The back of the hand'], 'a' => 2, 'd' => 'Easy', 'c' => 'Smoke Detector Knowledge', 'e' => 'The back of the hand is sensitive to heat and protects your palms for crawling.'],
            ['q' => 'If the door is HOT, what do you do?', 'o' => ['Open it anyway', 'Do not open it. Find another way.', 'Kick it down'], 'a' => 1, 'd' => 'Easy', 'c' => 'Smoke Detector Knowledge', 'e' => 'A hot door means fire is right outside. Use your backup escape route.'],
            ['q' => 'What is the \'Meeting Spot\'?', 'o' => ['A place inside the kitchen', 'A safe place outside where family gathers', 'The roof'], 'a' => 1, 'd' => 'Easy', 'c' => 'Smoke Detector Knowledge', 'e' => 'A meeting spot ensures everyone is safely out and accounted for.'],
            ['q' => 'The \'Golden Rule\' of evacuation integrity is:', 'o' => ['Once you are out, STAY OUT', 'Go back inside for pets', 'Run back for your phone'], 'a' => 0, 'd' => 'Easy', 'c' => 'Smoke Detector Knowledge', 'e' => 'Never go back inside a burning building for any reason.'],

            // MEDIUM (Parallel to Easy)
            ['q' => 'Why is it recommended to know two escape routes from your bedroom?', 'o' => ['In case the primary door is blocked by fire', 'So you have a choice of which way to run', 'Because it is fun to climb out windows'], 'a' => 0, 'd' => 'Medium', 'c' => 'Smoke Detector Knowledge', 'e' => 'Always have a primary route and a backup route.'],
            ['q' => 'When checking if a door is safe to open, which part of your body is used?', 'o' => ['Your foot to kick it', 'The palm of your hand', 'The back of your hand'], 'a' => 2, 'd' => 'Medium', 'c' => 'Smoke Detector Knowledge', 'e' => 'The back of the hand is sensitive to heat and protects your palms for crawling.'],
            ['q' => 'If you touch your bedroom door and it is extremely hot, what is your next step?', 'o' => ['Open it just a little bit to look', 'Keep it closed and use your backup window exit', 'Wait in bed for help'], 'a' => 1, 'd' => 'Medium', 'c' => 'Smoke Detector Knowledge', 'e' => 'A hot door means fire is right outside. Use your backup escape route.'],
            ['q' => 'Why should every family establish a permanent \'Meeting Spot\' outside?', 'o' => ['So everyone knows exactly where to gather safely', 'To have a place to wait for the school bus', 'To store extra food'], 'a' => 0, 'd' => 'Medium', 'c' => 'Smoke Detector Knowledge', 'e' => 'A meeting spot ensures everyone is safely out and accounted for.'],
            ['q' => 'If you left your favorite toy inside, why must you stay outside?', 'o' => ['Because toys can escape on their own', 'You must never re-enter a burning building', 'Because the fire is too bright'], 'a' => 1, 'd' => 'Medium', 'c' => 'Smoke Detector Knowledge', 'e' => 'Never go back inside a burning building for any reason.'],

            // HARD (Parallel to Easy)
            ['q' => 'When making an escape plan, what is the minimum number of exits per room?', 'o' => ['One exit, usually the main door', 'Two exits (like a main door and a window)', 'Three exits, including a trapdoor'], 'a' => 1, 'd' => 'Hard', 'c' => 'Smoke Detector Knowledge', 'e' => 'Always have a primary route and a backup route.'],
            ['q' => 'Why use the back of your hand to check a door instead of your palm?', 'o' => ['Burning your palm would make crawling out difficult', 'It is faster to use the back of your hand', 'The palm cannot feel heat through wood'], 'a' => 0, 'd' => 'Hard', 'c' => 'Smoke Detector Knowledge', 'e' => 'The back of the hand is sensitive to heat and protects your palms for crawling.'],
            ['q' => 'A hot door means fire is burning intensely outside. What must you do?', 'o' => ['Slowly turn the handle to verify', 'Leave the door shut and escape through your backup route', 'Call out to see if anyone is there'], 'a' => 1, 'd' => 'Hard', 'c' => 'Smoke Detector Knowledge', 'e' => 'A hot door means fire is right outside. Use your backup escape route.'],
            ['q' => 'Which of the following makes the best family meeting spot?', 'o' => ['The kitchen table', 'A safe, stationary place outside like a neighbor\'s gate', 'The roof of your house'], 'a' => 1, 'd' => 'Hard', 'c' => 'Smoke Detector Knowledge', 'e' => 'A meeting spot ensures everyone is safely out and accounted for.'],
            ['q' => 'What is the \'Golden Rule\' that applies to retrieving toys, phones, or pets?', 'o' => ['Only go back inside if the smoke is thin', 'Once you safely escape, never go back inside for any reason', 'You can go back inside if you run very fast'], 'a' => 1, 'd' => 'Hard', 'c' => 'Smoke Detector Knowledge', 'e' => 'Never go back inside a burning building for any reason.'],

            // ==========================================
            // MODULE 4: Get Low and Go! (Evacuation Planning)
            // ==========================================
            // EASY (True/False)
            ['q' => 'Smoke is heavy, so it sinks to the floor.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Easy', 'c' => 'Evacuation Planning', 'e' => 'False! Hot smoke is lighter than air and rises rapidly to the ceiling.'],
            ['q' => 'Most fire injuries come from smoke, not flames.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Easy', 'c' => 'Evacuation Planning', 'e' => 'True! Toxic smoke causes far more injuries than the flames themselves.'],
            ['q' => 'You should crawl on your hands and knees through smoke.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Easy', 'c' => 'Evacuation Planning', 'e' => 'True! Crawling keeps your head in the clean air zone near the floor.'],
            ['q' => 'Real smoke looks grey like in the movies.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Easy', 'c' => 'Evacuation Planning', 'e' => 'False! Real house fire smoke is completely pitch black.'],
            ['q' => 'Covering your nose with your shirt can help filter some particles.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Easy', 'c' => 'Evacuation Planning', 'e' => 'True! A cloth can act as a basic filter against large soot particles.'],

            // MEDIUM (Parallel to Easy, True/False)
            ['q' => 'Smoke from a fire is lighter than air and rises rapidly to the ceiling.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Medium', 'c' => 'Evacuation Planning', 'e' => 'True! Hot smoke is lighter than air and rises rapidly to the ceiling.'],
            ['q' => 'The actual flames in a house fire cause far more injuries than the toxic smoke.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Medium', 'c' => 'Evacuation Planning', 'e' => 'False! Toxic smoke causes far more injuries than the flames themselves.'],
            ['q' => 'If trapped in smoke, run as quickly as possible to the door.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Medium', 'c' => 'Evacuation Planning', 'e' => 'False! Crawling keeps your head in the clean air zone near the floor.'],
            ['q' => 'Real house fire smoke is completely pitch black and blocks vision.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Medium', 'c' => 'Evacuation Planning', 'e' => 'True! Real house fire smoke is completely pitch black.'],
            ['q' => 'Covering your mouth with a simple shirt helps filter out large ash particles.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Medium', 'c' => 'Evacuation Planning', 'e' => 'True! A cloth can act as a basic filter against large soot particles.'],

            // HARD (Parallel to Easy, True/False)
            ['q' => 'According to physics, the cleanest, most breathable air is close to the ceiling.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Hard', 'c' => 'Evacuation Planning', 'e' => 'False! Hot smoke is lighter than air and rises rapidly to the ceiling.'],
            ['q' => 'Inhaling toxic smoke is the leading cause of danger and fatalities in a fire.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Hard', 'c' => 'Evacuation Planning', 'e' => 'True! Toxic smoke causes far more injuries than the flames themselves.'],
            ['q' => 'Crawling on hands and knees keeps your head below the toxic smoke.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Hard', 'c' => 'Evacuation Planning', 'e' => 'True! Crawling keeps your head in the clean air zone near the floor.'],
            ['q' => 'Because real smoke is pitch black, keep one hand against a wall to guide you.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Hard', 'c' => 'Evacuation Planning', 'e' => 'True! Following a wall guarantees you won\'t get turned around in the dark.'],
            ['q' => 'A shirt filters ash particles and completely blocks invisible toxic gases.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Hard', 'c' => 'Evacuation Planning', 'e' => 'False! The shirt cannot filter out the invisible, toxic chemical gases.'],

            // ==========================================
            // MODULE 5: The Final Exam (Comprehensive)
            // ==========================================
            // EASY (10 questions covering all concepts)
            ['q' => 'What are the three things fire needs to burn (The Fire Triangle)?', 'o' => ['Heat, Fuel, Oxygen', 'Wood, Water, Air', 'Smoke, Ash, Sparks'], 'a' => 0, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'The Fire Triangle requires heat, fuel, and oxygen to exist.'],
            ['q' => 'Why are matches and lighters considered \'tools\' and not toys?', 'o' => ['They are too expensive for kids', 'They create heat and can start dangerous fires', 'Only teachers are allowed to use them'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'They produce heat/sparks that can easily ignite a fire.'],
            ['q' => 'What should you do if your buddy is missing during a school fire drill?', 'o' => ['Tell your teacher immediately', 'Run back inside to search for them', 'Hide under a desk until they return'], 'a' => 0, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Teachers need to know immediately so firefighters can safely search.'],
            ['q' => 'How is a School Fire Alarm different from a Recess Bell?', 'o' => ['It is quieter', 'It rings continuously (Long Ring)', 'It sounds like a piano'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'A continuous long ring is the signal for a fire emergency.'],
            ['q' => 'How many escape routes should you know for every room?', 'o' => ['Just one', 'Two (Door & Window)', 'None'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Always have a primary route and a backup route.'],
            ['q' => 'What part of your hand do you use to check a door?', 'o' => ['The palm', 'The fingertips', 'The back of the hand'], 'a' => 2, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'The back of the hand is sensitive to heat and protects your palms for crawling.'],
            ['q' => 'Smoke is heavy, so it sinks to the floor.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'False! Hot smoke is lighter than air and rises rapidly to the ceiling.'],
            ['q' => 'Most fire injuries come from smoke, not flames.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'True! Toxic smoke causes far more injuries than the flames themselves.'],
            ['q' => 'The \'Golden Rule\' of evacuation integrity is:', 'o' => ['Once you are out, STAY OUT', 'Go back inside for pets', 'Run back for your phone'], 'a' => 0, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'Never go back inside a burning building for any reason.'],
            ['q' => 'What is the \'Meeting Spot\'?', 'o' => ['A place inside the kitchen', 'A safe place outside where family gathers', 'The roof'], 'a' => 1, 'd' => 'Easy', 'c' => 'Final Exam', 'e' => 'A meeting spot ensures everyone is safely out and accounted for.'],

            // MEDIUM (10 questions, Parallel to Easy)
            ['q' => 'Which specific elements must combine to form the Fire Triangle?', 'o' => ['Heat, Fuel, Oxygen', 'Wood, Water, Wind', 'Light, Heat, Smoke'], 'a' => 0, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'The Fire Triangle requires heat, fuel, and oxygen to exist.'],
            ['q' => 'Why must you never play with matches and lighters?', 'o' => ['They provide the \'Heat\' to start a fire', 'They run out of fuel too quickly', 'They are expensive to replace'], 'a' => 0, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'They produce heat/sparks that can easily ignite a fire.'],
            ['q' => 'If your buddy is not with you during an evacuation, what is your first step?', 'o' => ['Notify your teacher immediately', 'Wait for them by the door', 'Go back to the classroom to check'], 'a' => 0, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Teachers need to know immediately so firefighters can safely search.'],
            ['q' => 'How can you tell that a School Fire Alarm is sounding?', 'o' => ['It emits a continuous long ring', 'It rings three short times', 'It plays music'], 'a' => 0, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'A continuous long ring is the signal for a fire emergency.'],
            ['q' => 'Why is it recommended to know two escape routes from your bedroom?', 'o' => ['In case the primary door is blocked by fire', 'So you have a choice of which way to run', 'Because it is fun to climb out windows'], 'a' => 0, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Always have a primary route and a backup route.'],
            ['q' => 'When checking if a door is safe to open, which part of your body is used?', 'o' => ['Your foot to kick it', 'The palm of your hand', 'The back of your hand'], 'a' => 2, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'The back of the hand is sensitive to heat and protects your palms for crawling.'],
            ['q' => 'Smoke from a fire is lighter than air and rises rapidly to the ceiling.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'True! Hot smoke is lighter than air and rises rapidly to the ceiling.'],
            ['q' => 'The actual flames in a house fire cause far more injuries than the toxic smoke.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'False! Toxic smoke causes far more injuries than the flames themselves.'],
            ['q' => 'If you left your favorite toy inside, why must you stay outside?', 'o' => ['Because toys can escape on their own', 'You must never re-enter a burning building', 'Because the fire is too bright'], 'a' => 1, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'Never go back inside a burning building for any reason.'],
            ['q' => 'Why should every family establish a permanent \'Meeting Spot\' outside?', 'o' => ['So everyone knows exactly where to gather safely', 'To have a place to wait for the school bus', 'To store extra food'], 'a' => 0, 'd' => 'Medium', 'c' => 'Final Exam', 'e' => 'A meeting spot ensures everyone is safely out and accounted for.'],

            // HARD (10 questions, Parallel to Easy)
            ['q' => 'Which of the following is NOT part of the Fire Triangle?', 'o' => ['Heat', 'Oxygen', 'Light'], 'a' => 2, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Fire produces light, but it only needs Heat, Fuel, and Oxygen to exist.'],
            ['q' => 'How do matches and lighters act in the Fire Triangle?', 'o' => ['They provide the heat needed to ignite fuel', 'They melt and ruin the furniture', 'They consume all the oxygen instantly'], 'a' => 0, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'They produce heat/sparks that can easily ignite a fire.'],
            ['q' => 'During a fire drill, why report a missing buddy instead of searching?', 'o' => ['Only trained firefighters can safely search inside', 'You might get lost in the hallways', 'You will miss the attendance check'], 'a' => 0, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Teachers need to know immediately so firefighters can safely search.'],
            ['q' => 'A continuous long ringing sound at school indicates what?', 'o' => ['A fire emergency requiring immediate evacuation', 'The end of the school day', 'A lockdown drill'], 'a' => 0, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'A continuous long ring is the signal for a fire emergency.'],
            ['q' => 'When making an escape plan, what is the minimum number of exits per room?', 'o' => ['One exit, usually the main door', 'Two exits (like a main door and a window)', 'Three exits, including a trapdoor'], 'a' => 1, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Always have a primary route and a backup route.'],
            ['q' => 'Why use the back of your hand to check a door instead of your palm?', 'o' => ['Burning your palm would make crawling out difficult', 'It is faster to use the back of your hand', 'The palm cannot feel heat through wood'], 'a' => 0, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'The back of the hand is sensitive to heat and protects your palms for crawling.'],
            ['q' => 'According to physics, the cleanest, most breathable air is close to the ceiling.', 'o' => ['True', 'False'], 'a' => 1, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'False! Hot smoke is lighter than air and rises rapidly to the ceiling.'],
            ['q' => 'Inhaling toxic smoke is the leading cause of danger and fatalities in a fire.', 'o' => ['True', 'False'], 'a' => 0, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'True! Toxic smoke causes far more injuries than the flames themselves.'],
            ['q' => 'What is the \'Golden Rule\' that applies to retrieving toys, phones, or pets?', 'o' => ['Only go back inside if the smoke is thin', 'Once you safely escape, never go back inside for any reason', 'You can go back inside if you run very fast'], 'a' => 1, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'Never go back inside a burning building for any reason.'],
            ['q' => 'Which of the following makes the best family meeting spot?', 'o' => ['The kitchen table', 'A safe, stationary place outside like a neighbor\'s gate', 'The roof of your house'], 'a' => 1, 'd' => 'Hard', 'c' => 'Final Exam', 'e' => 'A meeting spot ensures everyone is safely out and accounted for.']

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
