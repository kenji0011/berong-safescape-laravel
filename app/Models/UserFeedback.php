<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserFeedback extends Model
{
    protected $table = 'user_feedback';

    protected $fillable = [
        'userId',
        'featureName',
        'featureType',
        'rating',
        'comments',
        'sessionId',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }
}
