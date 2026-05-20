<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'firstName',
        'lastName',
        'age',
        'role',
        'gender',
        'barangay',
        'school',
        'school_id',
        'avatar',
        'occupation',
        'preTestScore',
        'postTestScore',
        'engagementPoints',
        'profileCompleted',
        'competency_scores',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'age' => 'integer',
            'preTestScore' => 'integer',
            'postTestScore' => 'integer',
            'engagementPoints' => 'integer',
            'profileCompleted' => 'boolean',
            'competency_scores' => 'array',
        ];
    }

    // Relationships
    public function blogPosts() { return $this->hasMany(BlogPost::class, 'authorId'); }
    public function progress() { return $this->hasMany(UserProgress::class, 'userId'); }
    public function quizResults() { return $this->hasMany(QuizResult::class, 'userId'); }
    public function notifications() { return $this->hasMany(Notification::class, 'userId'); }
    public function safeScapeProgress() { return $this->hasMany(SafeScapeProgress::class, 'userId'); }
    public function assessmentAnswers() { return $this->hasMany(UserAnswer::class, 'userId'); }
    public function engagementLogs() { return $this->hasMany(EngagementLog::class, 'userId'); }
    public function floorPlans() { return $this->hasMany(FloorPlan::class, 'userId'); }
    public function simulationJobs() { return $this->hasMany(SimulationJob::class, 'userId'); }
    public function school() { return $this->belongsTo(School::class, 'school_id'); }
    public function feedbacks() { return $this->hasMany(UserFeedback::class, 'userId'); }
    public function badges() { return $this->hasMany(UserBadge::class, 'userId'); }
}
