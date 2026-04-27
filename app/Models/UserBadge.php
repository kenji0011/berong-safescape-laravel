<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBadge extends Model
{
    protected $fillable = [
        'userId',
        'badge_id',
        'badge_name',
        'badge_icon',
        'earnedAt',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }
}
