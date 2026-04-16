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

    /**
     * Recalculate cached analytics from live user data.
     */
    public function recalculateAnalytics(): void
    {
        $users = $this->users;

        $this->totalStudents = $users->count();
        $this->averagePreTestScore = $users->avg('preTestScore') ?? 0;
        $this->averagePostTestScore = $users->avg('postTestScore') ?? 0;

        // Calculate completion rate: users who completed at least 1 module / total users
        if ($this->totalStudents > 0) {
            $completedUsers = $users->filter(fn($u) => $u->progress()->where('completed', true)->exists())->count();
            $this->averageCompletionRate = round(($completedUsers / $this->totalStudents) * 100, 1);
        }

        $this->totalModulesCompleted = $users->sum(fn($u) => $u->progress()->where('completed', true)->count());

        $this->save();
    }
}
