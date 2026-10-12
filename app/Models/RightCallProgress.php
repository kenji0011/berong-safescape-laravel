<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RightCallProgress extends Model
{
    use HasFactory;

    protected $table = 'right_call_progress';

    protected $fillable = [
        'user_id',
        'high_score',
        'total_calls_handled',
        'successful_calls',
        'failed_calls',
        'accuracy_rate',
        'current_rank',
        'completed_scenarios',
        'game_state_data',
        'last_played_at',
    ];

    protected $casts = [
        'high_score'           => 'integer',
        'total_calls_handled'  => 'integer',
        'successful_calls'     => 'integer',
        'failed_calls'         => 'integer',
        'accuracy_rate'        => 'float',
        'completed_scenarios'  => 'array',
        'game_state_data'      => 'array',
        'last_played_at'       => 'datetime',
    ];

    /**
     * Relationship: The player who owns this progress record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
