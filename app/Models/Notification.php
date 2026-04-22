<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Notification extends Model
{
    use HasFactory;

    // The table associated with the model.
    protected $table = 'notifications';

    // Disable default timestamps since the table only has createdAt
    public $timestamps = false;

    protected $fillable = [
        'userId',
        'title',
        'message',
        'type',
        'category',
        'isRead',
        'createdAt',
    ];

    protected $casts = [
        'isRead' => 'boolean',
        'createdAt' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }

    /**
     * Helper to broadcast a notification to all active users.
     * Use this when adding new general content (blog, video, etc.)
     */
    public static function broadcast($title, $message, $type, $category, $targetRoles = null)
    {
        $query = User::where('isActive', true);

        if ($targetRoles) {
            $roles = is_array($targetRoles) ? $targetRoles : [$targetRoles];
            $query->whereIn('role', $roles);
        }

        // Chunking to handle large amounts of users if necessary
        $query->chunk(500, function ($users) use ($title, $message, $type, $category) {
            $data = [];
            $now = now();
            foreach ($users as $user) {
                $data[] = [
                    'userId' => $user->id,
                    'title' => $title,
                    'message' => $message,
                    'type' => $type,
                    'category' => $category,
                    'isRead' => false,
                    'createdAt' => $now,
                ];
            }
            
            self::insert($data);
        });
    }
}
