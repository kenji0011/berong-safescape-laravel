<?php
$users = App\Models\User::whereNotNull('school')->whereNull('school_id')->get();
foreach ($users as $user) {
    $school = App\Models\School::firstOrCreate(
        ['name' => $user->school],
        ['isActive' => true, 'type' => 'Other', 'totalStudents' => 0]
    );
    if ($school) {
        $user->school_id = $school->id;
        $user->save();
        $school->recalculateAnalytics();
    }
}
echo "Fixed " . $users->count() . " users.\n";
