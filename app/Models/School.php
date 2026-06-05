<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    protected $fillable = [
        'name',
        'address',
        'region',
        'district',
        'type',
        'contactPerson',
        'contactEmail',
        'contactPhone',
        'totalStudents',
        'averagePreTestScore',
        'averagePostTestScore',
        'averageCompletionRate',
        'totalModulesCompleted',
        'isActive',
    ];

    protected function casts(): array
    {
        return [
            'totalStudents' => 'integer',
            'averagePreTestScore' => 'float',
            'averagePostTestScore' => 'float',
            'averageCompletionRate' => 'float',
            'totalModulesCompleted' => 'integer',
            'isActive' => 'boolean',
        ];
    }

    // Relationships
    public function users()
    {
        return $this->hasMany(User::class, 'school_id');
    }

    public function recalculateAnalytics(): void
    {
        // 1. Get basic aggregates in one database query
        $stats = \App\Models\User::where('school_id', $this->id)
            ->selectRaw('
                COUNT(*) as total_students,
                AVG("preTestScore") as avg_pre_test,
                AVG("postTestScore") as avg_post_test
            ')
            ->first();

        $this->totalStudents = (int) ($stats->total_students ?? 0);
        $this->averagePreTestScore = round((float) ($stats->avg_pre_test ?? 0), 2);
        $this->averagePostTestScore = round((float) ($stats->avg_post_test ?? 0), 2);

        // 2. Calculate completion rate (users with at least 1 completed module)
        if ($this->totalStudents > 0) {
            $completedUsers = \App\Models\User::where('school_id', $this->id)
                ->whereHas('safeScapeProgress', function($q) {
                    $q->where('completed', true);
                })->count();
            $this->averageCompletionRate = round(($completedUsers / $this->totalStudents) * 100, 1);
        } else {
            $this->averageCompletionRate = 0;
        }

        // 3. Calculate total modules completed across the school
        $this->totalModulesCompleted = \App\Models\SafeScapeProgress::join('users', 'safescape_progress.userId', '=', 'users.id')
            ->where('users.school_id', $this->id)
            ->where('safescape_progress.completed', true)
            ->count();

        $this->save();
    }
}
