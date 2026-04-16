<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\CarouselImage;
use App\Models\Video;
use App\Models\BlogPost;
use App\Models\KidsModule;
use App\Models\QuickQuestion;
use App\Models\AssessmentQuestion;
use App\Models\School;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ============================
        // 1. Users
        // ============================
        $admin = User::updateOrCreate(['username' => 'admin'], [
            'email' => 'admin@bfp.gov.ph',
            'password' => Hash::make('admin123'),
            'name' => 'BFP Administrator',
            'firstName' => 'BFP',
            'lastName' => 'Administrator',
            'age' => 30,
            'role' => 'admin',
        ]);

        $kid = User::updateOrCreate(['username' => 'testkid'], [
            'email' => 'kid@bfp.gov.ph',
            'password' => Hash::make('kid123'),
            'name' => 'Young Firefighter',
            'firstName' => 'Young',
            'lastName' => 'Firefighter',
            'age' => 12,
            'role' => 'kid',
        ]);

        $adult = User::updateOrCreate(['username' => 'testadult'], [
            'email' => 'adult@bfp.gov.ph',
            'password' => Hash::make('adult123'),
            'name' => 'John Smith',
            'firstName' => 'John',
            'lastName' => 'Smith',
            'age' => 25,
            'role' => 'adult',
        ]);

        $pro = User::updateOrCreate(['username' => 'testpro'], [
            'email' => 'pro@bfp.gov.ph',
            'password' => Hash::make('pro123'),
            'name' => 'Firefighter Cruz',
            'firstName' => 'Firefighter',
            'lastName' => 'Cruz',
            'age' => 28,
            'role' => 'professional',
        ]);

        $this->command->info('✅ Created users (admin/testkid/testadult/testpro)');

        // ============================
        // 1b. Schools (Per-School Analytics)
        // ============================
        $schools = [
            ['name' => 'Sta. Cruz Central Elementary School', 'address' => 'Poblacion, Sta. Cruz, Laguna', 'region' => 'Region IV-A (CALABARZON)', 'district' => 'Sta. Cruz District', 'type' => 'elementary'],
            ['name' => 'Sta. Cruz National High School', 'address' => 'Poblacion, Sta. Cruz, Laguna', 'region' => 'Region IV-A (CALABARZON)', 'district' => 'Sta. Cruz District', 'type' => 'highschool'],
            ['name' => 'Laguna State Polytechnic University - Sta. Cruz', 'address' => 'Sta. Cruz, Laguna', 'region' => 'Region IV-A (CALABARZON)', 'district' => 'Sta. Cruz District', 'type' => 'college'],
            ['name' => 'Pili Elementary School', 'address' => 'Pili, Sta. Cruz, Laguna', 'region' => 'Region IV-A (CALABARZON)', 'district' => 'Sta. Cruz District', 'type' => 'elementary'],
            ['name' => 'Barangay Pagsawitan Elementary School', 'address' => 'Pagsawitan, Sta. Cruz, Laguna', 'region' => 'Region IV-A (CALABARZON)', 'district' => 'Sta. Cruz District', 'type' => 'elementary'],
            ['name' => 'Bagumbayan Elementary School', 'address' => 'Bagumbayan, Sta. Cruz, Laguna', 'region' => 'Region IV-A (CALABARZON)', 'district' => 'Sta. Cruz District', 'type' => 'elementary'],
        ];
        foreach ($schools as $s) {
            School::updateOrCreate(['name' => $s['name']], $s);
        }

        // Link test users to schools
        $school1 = School::where('name', 'Sta. Cruz Central Elementary School')->first();
        $school2 = School::where('name', 'Sta. Cruz National High School')->first();
        if ($school1) $kid->update(['school_id' => $school1->id]);
        if ($school2) $adult->update(['school_id' => $school2->id]);

        $this->command->info('✅ Seeded schools and linked test users');

        // ============================
        // 2. Carousel Images
        // ============================
        $carouselImages = [
            ['title' => 'BFP Firefighters in Action', 'altText' => 'BFP Firefighters in Action', 'imageUrl' => '/web-background-image.jpg', 'order' => 1, 'isActive' => true],
            ['title' => 'Fire Safety Training', 'altText' => 'Fire Safety Training', 'imageUrl' => '/fire-safety-training-session.jpg', 'order' => 2, 'isActive' => true],
            ['title' => 'BFP Sta Cruz - Always Ready', 'altText' => 'BFP Sta Cruz', 'imageUrl' => '/bfp-sta-cruz-fire-station.jpg', 'order' => 3, 'isActive' => true],
        ];
        foreach ($carouselImages as $img) {
            CarouselImage::updateOrCreate(['title' => $img['title']], $img);
        }
        $this->command->info('✅ Seeded carousel images');

        // ============================
        // 3. Videos
        // ============================
        $videos = [
            ['title' => 'Advanced Firefighting Techniques', 'description' => 'Professional firefighting methods and strategies', 'youtubeId' => 'W25rzeEO740', 'category' => 'professional', 'duration' => '15:30', 'isActive' => true],
            ['title' => 'Fire Code Compliance', 'description' => 'Understanding fire safety regulations', 'youtubeId' => 'ldPH_D60jpo', 'category' => 'professional', 'duration' => '12:45', 'isActive' => true],
            ['title' => 'Emergency Response Protocols', 'description' => 'Standard operating procedures for emergencies', 'youtubeId' => '9XpJZv_YsGM', 'category' => 'professional', 'duration' => '18:20', 'isActive' => true],
            ['title' => 'Fire Investigation Basics', 'description' => 'Introduction to fire investigation techniques', 'youtubeId' => '5_YeQpOXnP8', 'category' => 'professional', 'duration' => '20:15', 'isActive' => true],
            ['title' => 'Hazardous Materials Handling', 'description' => 'Safe handling of hazardous materials in fire scenarios', 'youtubeId' => 'q_oBg1U2x9Q', 'category' => 'professional', 'duration' => '16:40', 'isActive' => true],
            ['title' => 'Rescue Operations', 'description' => 'Advanced rescue techniques and equipment', 'youtubeId' => 'x1oo76Y_87A', 'category' => 'professional', 'duration' => '14:25', 'isActive' => true],
            ['title' => 'Fire Prevention Strategies', 'description' => 'Proactive fire prevention in communities', 'youtubeId' => 'sCmPKeTILq4', 'category' => 'professional', 'duration' => '11:30', 'isActive' => true],
        ];
        foreach ($videos as $v) {
            Video::updateOrCreate(['youtubeId' => $v['youtubeId']], $v);
        }
        $this->command->info('✅ Seeded videos');

        // ============================
        // 4. Blog Posts
        // ============================
        $blogs = [
            ['title' => 'Home Fire Safety Essentials', 'excerpt' => 'Learn the basic fire safety measures every home should have', 'content' => 'Fire safety at home is crucial for protecting your family and property. Install smoke detectors on every level of your home, especially near bedrooms. Test them monthly and replace batteries annually.', 'imageUrl' => '/home-fire-safety-equipment.jpg', 'category' => 'adult', 'authorId' => $adult->id, 'isPublished' => true],
            ['title' => 'Kitchen Fire Prevention', 'excerpt' => 'Prevent the most common cause of home fires', 'content' => 'Kitchen fires are the leading cause of home fires. Never leave cooking unattended, especially when frying, grilling, or broiling. Keep flammable items away from the stove.', 'imageUrl' => '/kitchen-fire-safety-cooking.jpg', 'category' => 'adult', 'authorId' => $adult->id, 'isPublished' => true],
            ['title' => 'Electrical Fire Safety', 'excerpt' => 'Protect your home from electrical hazards', 'content' => 'Electrical fires can be prevented with proper awareness. Avoid overloading outlets and power strips. Replace damaged or frayed electrical cords immediately.', 'imageUrl' => '/electrical-safety-outlets-wiring.jpg', 'category' => 'adult', 'authorId' => $adult->id, 'isPublished' => true],
            ['title' => 'Fire Escape Planning', 'excerpt' => 'Create an effective evacuation plan for your family', 'content' => 'A well-practiced fire escape plan can save lives. Draw a floor plan of your home showing all doors and windows. Mark two escape routes from each room.', 'imageUrl' => '/family-fire-escape-plan.jpg', 'category' => 'adult', 'authorId' => $adult->id, 'isPublished' => true],
            ['title' => 'Smoke Detector Maintenance', 'excerpt' => 'Keep your first line of defense working properly', 'content' => 'Smoke detectors are your first warning of fire. Install them on every level of your home and in every bedroom. Test detectors monthly by pressing the test button.', 'imageUrl' => '/smoke-detector-alarm-maintenance.jpg', 'category' => 'adult', 'authorId' => $adult->id, 'isPublished' => true],
            ['title' => 'Fire Extinguisher Guide', 'excerpt' => 'Know how to use a fire extinguisher effectively', 'content' => 'Remember PASS: Pull the pin, Aim at the base of the fire, Squeeze the handle, and Sweep from side to side. Keep extinguishers in accessible locations.', 'imageUrl' => '/fire-extinguisher-usage-demonstration.jpg', 'category' => 'adult', 'authorId' => $adult->id, 'isPublished' => true],
        ];
        foreach ($blogs as $b) {
            BlogPost::updateOrCreate(['title' => $b['title']], $b);
        }
        $this->command->info('✅ Seeded blog posts');

        // ============================
        // 5. Kids Modules
        // ============================
        $modules = [
            ['title' => 'Fire Safety Basics', 'description' => 'Introduction to fire safety for kids', 'dayNumber' => 1, 'content' => 'Fire is hot and can be dangerous. We need to learn how to stay safe around fire.', 'isActive' => true],
            ['title' => 'Stop, Drop, and Roll', 'description' => 'What to do if your clothes catch fire', 'dayNumber' => 2, 'content' => 'If your clothes ever catch on fire, remember: Stop, Drop, and Roll!', 'isActive' => true],
            ['title' => 'Smoke Detectors', 'description' => 'Why smoke detectors are important', 'dayNumber' => 3, 'content' => 'Smoke detectors are like watchdogs that warn us when there is smoke or fire.', 'isActive' => true],
            ['title' => 'Fire Escape Plan', 'description' => 'Planning how to get out of the house safely', 'dayNumber' => 4, 'content' => 'Every family needs a fire escape plan. Draw a map of your home and mark two ways out of every room.', 'isActive' => true],
            ['title' => 'Firefighter Heroes', 'description' => 'Learning about firefighters and their equipment', 'dayNumber' => 5, 'content' => 'Firefighters are brave heroes who help us when there are fires.', 'isActive' => true],
        ];
        foreach ($modules as $m) {
            KidsModule::updateOrCreate(['dayNumber' => $m['dayNumber']], $m);
        }
        $this->command->info('✅ Seeded kids modules');

        // ============================
        // 6. Quick Questions (Chatbot)
        // ============================
        $quickQuestions = [
            ['category' => 'emergency', 'questionText' => 'What should I do if I see a fire?', 'responseText' => 'If you see a fire, immediately evacuate the area and call emergency services (911). Never try to retrieve personal belongings.', 'order' => 1, 'isActive' => true],
            ['category' => 'emergency', 'questionText' => 'How do I report a fire emergency?', 'responseText' => 'Call 911 immediately. Provide your exact location, the nature of the emergency, and any relevant details.', 'order' => 2, 'isActive' => true],
            ['category' => 'emergency', 'questionText' => 'What is the emergency number?', 'responseText' => 'In case of fire emergency, dial 911. For non-emergency inquiries, visit your nearest BFP station.', 'order' => 3, 'isActive' => true],
            ['category' => 'prevention', 'questionText' => 'How can I prevent home fires?', 'responseText' => 'Never leave cooking unattended, keep flammable items away from heat sources, have electrical wiring checked regularly.', 'order' => 1, 'isActive' => true],
            ['category' => 'prevention', 'questionText' => 'What are common fire hazards?', 'responseText' => 'Unattended candles, overloaded electrical outlets, faulty wiring, uncleaned dryer vents, improperly stored flammable materials.', 'order' => 2, 'isActive' => true],
            ['category' => 'equipment', 'questionText' => 'How do I use a fire extinguisher?', 'responseText' => 'Remember PASS: Pull the pin, Aim at the base of the fire, Squeeze the handle, Sweep from side to side.', 'order' => 1, 'isActive' => true],
            ['category' => 'equipment', 'questionText' => 'How do I test my smoke alarm?', 'responseText' => 'Press and hold the test button. If it does not sound, replace the batteries immediately. Test monthly.', 'order' => 2, 'isActive' => true],
            ['category' => 'general', 'questionText' => 'How do I create a fire escape plan?', 'responseText' => 'Draw a map of your home, mark two ways out of each room, establish a meeting place outside, practice twice a year.', 'order' => 1, 'isActive' => true],
        ];
        foreach ($quickQuestions as $qq) {
            QuickQuestion::updateOrCreate(['questionText' => $qq['questionText']], $qq);
        }
        $this->command->info('✅ Seeded quick questions');

        // ============================
        // 7. Assessment Questions (30 total distinct questions -> 60 db rows)
        // ============================
        $kidQuestions = [
            ['question' => 'What is the emergency number to call in case of fire?', 'options' => ['911', '123', '456', '000'], 'correctAnswer' => 0, 'forRoles' => ['kid'], 'order' => 1, 'explanation' => '911 is the universal emergency number.', 'category' => 'Emergency Response', 'isActive' => true],
            ['question' => 'What should you do if your clothes catch fire?', 'options' => ['Run fast', 'Stop, Drop, and Roll', 'Jump up and down', 'Hide under the bed'], 'correctAnswer' => 1, 'forRoles' => ['kid'], 'order' => 2, 'explanation' => 'Stop, Drop, and Roll puts the fire out.', 'category' => 'Emergency Response', 'isActive' => true],
            ['question' => 'Where should you go when there is a fire?', 'options' => ['Under the bed', 'In the closet', 'Outside to a safe meeting place', 'In the bathroom'], 'correctAnswer' => 2, 'forRoles' => ['kid'], 'order' => 3, 'explanation' => 'Always go outside to your agreed meeting place.', 'category' => 'Evacuation Planning', 'isActive' => true],
            ['question' => 'Which of these is safe to play with?', 'options' => ['Matches', 'Lighter', 'Toys', 'Candles'], 'correctAnswer' => 2, 'forRoles' => ['kid'], 'order' => 4, 'explanation' => 'Matches, lighters, and candles are for adults.', 'category' => 'Fire Prevention', 'isActive' => true],
            ['question' => 'Who can help us put out fires?', 'options' => ['Police Officer', 'Firefighter', 'Doctor', 'Teacher'], 'correctAnswer' => 1, 'forRoles' => ['kid'], 'order' => 5, 'explanation' => 'Firefighters are trained to put out fires.', 'category' => 'General Safety Awareness', 'isActive' => true],
            ['question' => 'What does a smoke alarm do?', 'options' => ['Makes music', 'Beeps loudly when there is smoke', 'Cooks food', 'Cleans the air'], 'correctAnswer' => 1, 'forRoles' => ['kid'], 'order' => 6, 'explanation' => 'Smoke alarms beep loudly to warn us.', 'category' => 'Smoke Detector Knowledge', 'isActive' => true],
            ['question' => 'Why should we stay low (crawl) in a fire?', 'options' => ['To play a game', 'Because the air is cleaner down low', 'To find lost toys', 'To sleep'], 'correctAnswer' => 1, 'forRoles' => ['kid'], 'order' => 7, 'explanation' => 'Smoke rises. The air is cleaner near the floor.', 'category' => 'Evacuation Planning', 'isActive' => true],
            ['question' => 'If a door handle is hot, should you open it?', 'options' => ['Yes', 'No', 'Maybe', 'Only if you are fast'], 'correctAnswer' => 1, 'forRoles' => ['kid'], 'order' => 8, 'explanation' => 'A hot handle means fire is on the other side.', 'category' => 'Evacuation Planning', 'isActive' => true],
            ['question' => 'What should you stick to during a fire?', 'options' => ['The TV', 'Your toys', 'The Fire Escape Plan', 'The fridge'], 'correctAnswer' => 2, 'forRoles' => ['kid'], 'order' => 9, 'explanation' => 'Follow your family\'s Fire Escape Plan.', 'category' => 'Evacuation Planning', 'isActive' => true],
            ['question' => 'Is fire a toy?', 'options' => ['Yes', 'No', 'Sometimes', 'Only on birthdays'], 'correctAnswer' => 1, 'forRoles' => ['kid'], 'order' => 10, 'explanation' => 'Fire is dangerous. It is never a toy.', 'category' => 'Fire Prevention', 'isActive' => true],
            ['question' => 'How many ways out of your house should you know?', 'options' => ['None', 'One', 'At least two', 'Only windows'], 'correctAnswer' => 2, 'forRoles' => ['kid'], 'order' => 11, 'explanation' => 'Know at least two ways out of every room.', 'category' => 'Evacuation Planning', 'isActive' => true],
            ['question' => 'What should you do after escaping a fire?', 'options' => ['Go back inside', 'Go to the meeting place and call for help', 'Watch the fire', 'Try to put it out'], 'correctAnswer' => 1, 'forRoles' => ['kid'], 'order' => 12, 'explanation' => 'Once out, stay out! Go to meeting place and call 911.', 'category' => 'Emergency Response', 'isActive' => true],
            ['question' => 'What should you do if there is a lot of smoke?', 'options' => ['Stand up tall', 'Cover your nose and crawl low', 'Open a window', 'Yell loudly'], 'correctAnswer' => 1, 'forRoles' => ['kid'], 'order' => 13, 'explanation' => 'Cover your nose and crawl low where air is cleaner.', 'category' => 'Emergency Response', 'isActive' => true],
            ['question' => 'Can you hide under the bed during a fire?', 'options' => ['Yes, it is safe', 'No, firefighters cannot find you', 'Only if scared', 'Yes, fire cannot reach'], 'correctAnswer' => 1, 'forRoles' => ['kid'], 'order' => 14, 'explanation' => 'Never hide! Firefighters need to find you. Get out!', 'category' => 'General Safety Awareness', 'isActive' => true],
            ['question' => 'What is a fire drill?', 'options' => ['A game with fire', 'Practice escaping from a fire safely', 'A tool firefighters use', 'A type of alarm'], 'correctAnswer' => 1, 'forRoles' => ['kid'], 'order' => 15, 'explanation' => 'A fire drill is practicing your fire escape plan.', 'category' => 'Evacuation Planning', 'isActive' => true],
        ];

        $adultQuestions = [
            ['question' => 'What is the most common cause of house fires?', 'options' => ['Cooking', 'Heating', 'Electrical', 'Smoking'], 'correctAnswer' => 0, 'forRoles' => ['adult', 'professional'], 'order' => 1, 'explanation' => 'Unattended cooking is the leading cause of home fires.', 'category' => 'Kitchen Safety', 'isActive' => true],
            ['question' => 'How often should you test your smoke alarms?', 'options' => ['Once a year', 'Every month', 'Every 6 months', 'Never'], 'correctAnswer' => 1, 'forRoles' => ['adult', 'professional'], 'order' => 2, 'explanation' => 'Test smoke alarms at least once a month.', 'category' => 'Smoke Detector Knowledge', 'isActive' => true],
            ['question' => 'What does the PASS acronym stand for?', 'options' => ['Pull, Aim, Squeeze, Sweep', 'Push, Aim, Squeeze, Sweep', 'Pull, Arm, Shoot, Sweep', 'Point, Aim, Shoot, Spray'], 'correctAnswer' => 0, 'forRoles' => ['adult', 'professional'], 'order' => 3, 'explanation' => 'PASS: Pull, Aim, Squeeze, Sweep.', 'category' => 'Fire Extinguisher Use', 'isActive' => true],
            ['question' => 'Where is the best place to install a smoke alarm?', 'options' => ['Kitchen', 'Garage', 'Ceiling or high on a wall', 'Near a window'], 'correctAnswer' => 2, 'forRoles' => ['adult', 'professional'], 'order' => 4, 'explanation' => 'Mount alarms high on walls or ceilings where smoke rises.', 'category' => 'Smoke Detector Knowledge', 'isActive' => true],
            ['question' => 'What should you have to help escape a fire?', 'options' => ['A rope', 'A ladder', 'A fire escape plan', 'A flashlight'], 'correctAnswer' => 2, 'forRoles' => ['adult', 'professional'], 'order' => 5, 'explanation' => 'A practised fire escape plan ensures quick, safe exits.', 'category' => 'Evacuation Planning', 'isActive' => true],
            ['question' => 'What is the best type of fire extinguisher to use for kitchen grease fires involving cooking oil?', 'options' => ['Class A (for Wood & Paper)', 'Class B (for Flammable Liquids like Gas)', 'Class K (for Kitchen Cooking Oils)', 'Water Extinguisher'], 'correctAnswer' => 2, 'forRoles' => ['adult', 'professional'], 'order' => 6, 'explanation' => 'Class K is designed for cooking oils and greases. Never use water on a grease fire!', 'category' => 'Fire Extinguisher Use', 'isActive' => true],
            ['question' => 'If a fire starts in a pan, what should you do?', 'options' => ['Throw water', 'Slide a lid over it', 'Carry it outside', 'Fan the flames'], 'correctAnswer' => 1, 'forRoles' => ['adult', 'professional'], 'order' => 7, 'explanation' => 'Slide a lid to smother flames. Never use water on grease.', 'category' => 'Kitchen Safety', 'isActive' => true],
            ['question' => 'How often should you replace smoke alarm batteries?', 'options' => ['Every month', 'Every 6 months', 'At least once a year', 'Every 5 years'], 'correctAnswer' => 2, 'forRoles' => ['adult', 'professional'], 'order' => 8, 'explanation' => 'Replace batteries at least once a year.', 'category' => 'Smoke Detector Knowledge', 'isActive' => true],
            ['question' => 'At what height does smoke usually gather first?', 'options' => ['Floor level', 'Waist level', 'Eye level', 'Ceiling level'], 'correctAnswer' => 3, 'forRoles' => ['adult', 'professional'], 'order' => 9, 'explanation' => 'Smoke is warm and rises, filling from ceiling down.', 'category' => 'General Safety Awareness', 'isActive' => true],
            ['question' => 'What is the second most common cause of home fires?', 'options' => ['Cooking', 'Heating', 'Electrical malfunction', 'Candles'], 'correctAnswer' => 1, 'forRoles' => ['adult', 'professional'], 'order' => 10, 'explanation' => 'Heating equipment is the second leading cause.', 'category' => 'Fire Prevention', 'isActive' => true],
            ['question' => 'What distance to maintain when using an extinguisher?', 'options' => ['1 foot', '3 to 6 feet', '10 to 15 feet', '20 feet or more'], 'correctAnswer' => 1, 'forRoles' => ['adult', 'professional'], 'order' => 11, 'explanation' => 'Stand about 3-6 feet away for effective coverage.', 'category' => 'Fire Extinguisher Use', 'isActive' => true],
            ['question' => 'What if you cannot extinguish a fire within 30 seconds?', 'options' => ['Keep trying', 'Call a neighbor', 'Evacuate and call 911', 'Open windows'], 'correctAnswer' => 2, 'forRoles' => ['adult', 'professional'], 'order' => 12, 'explanation' => 'If not quickly controlled, evacuate and call 911.', 'category' => 'Emergency Response', 'isActive' => true],
            ['question' => 'How should flammable liquids be stored at home?', 'options' => ['Any container in kitchen', 'Approved containers away from heat', 'Near water heater', 'Near electrical outlets'], 'correctAnswer' => 1, 'forRoles' => ['adult', 'professional'], 'order' => 13, 'explanation' => 'Store in approved containers away from heat and sparks.', 'category' => 'Fire Prevention', 'isActive' => true],
            ['question' => 'What is "octopus wiring" and why is it dangerous?', 'options' => ['Outdoor wiring', 'Too many plugs on one outlet causing overload', 'Underwater electrical', 'A brand of cords'], 'correctAnswer' => 1, 'forRoles' => ['adult', 'professional'], 'order' => 14, 'explanation' => 'Overloads outlets causing overheating and electrical fires.', 'category' => 'Electrical Safety', 'isActive' => true],
            ['question' => 'What should every floor of your home have?', 'options' => ['Fire extinguisher only', 'A working smoke alarm', 'A fire escape ladder', 'A bucket of water'], 'correctAnswer' => 1, 'forRoles' => ['adult', 'professional'], 'order' => 15, 'explanation' => 'Every floor should have at least one working smoke alarm.', 'category' => 'Smoke Detector Knowledge', 'isActive' => true],
        ];

        // Seed them for both preTest and postTest
        foreach (['preTest', 'postTest'] as $type) {
            foreach ($kidQuestions as $q) {
                $q['type'] = $type;
                AssessmentQuestion::updateOrCreate(['question' => $q['question'], 'type' => $type], $q);
            }
            foreach ($adultQuestions as $q) {
                $q['type'] = $type;
                AssessmentQuestion::updateOrCreate(['question' => $q['question'], 'type' => $type], $q);
            }
        }
        $this->command->info('✅ Seeded 30 assessment questions for BOTH preTest and postTest (60 rows total)');

        // Summary
        $this->command->info('');
        $this->command->info('🎉 Database seeding completed!');
        $this->command->info('');
        $this->command->info('📋 Test Accounts:');
        $this->command->info('  Admin: admin / admin123');
        $this->command->info('  Kid:   testkid / kid123');
        $this->command->info('  Adult: testadult / adult123');
        $this->command->info('  Pro:   testpro / pro123');
    }
}
