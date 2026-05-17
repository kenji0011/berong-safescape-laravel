"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/permission-guard';

// Define the type for a video highlight item
type VideoHighlightItem = {
    id: number;
    title: string;
    description: string;
    youtubeId: string; // The unique ID of the YouTube video
    link: string; // Link to the full video page or related content
    requiredPermission: 'accessKids' | 'accessAdult' | 'accessProfessional' | 'isAdmin';
};

// Mock data for the video highlight - this will be replaced by dynamic data fetching
const mockVideoHighlight: VideoHighlightItem = {
    id: 1,
    title: 'First Aid Tutorial',
    description: 'Learn the proper technique for doing first aid with this tutorial.',
    youtubeId: 'sCmPKeTILq4',
    link: '/professional', // Link to professional section
    requiredPermission: 'accessProfessional',
};

export function VideoHighlight() {
    const { title, description, youtubeId, link, requiredPermission } = mockVideoHighlight;

    const extractYoutubeId = (id: string) => {
        if (!id) return '';
        if (id.includes('youtube.com') || id.includes('youtu.be')) {
            const regex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([^&?\n]+)/;
            const match = id.match(regex);
            if (match && match[1]) {
                id = match[1];
            } else {
                try {
                    const url = new URL(id);
                    if (url.hostname.includes('youtube.com')) {
                        id = url.searchParams.get('v') || id.split('/').pop() || id;
                    } else if (url.hostname.includes('youtu.be')) {
                        id = url.pathname.slice(1);
                    }
                } catch (e) { }
            }
        }
        if (id.includes('?')) id = id.split('?')[0];
        if (id.includes('&')) id = id.split('&')[0];
        return id;
    };

    const cleanId = extractYoutubeId(youtubeId);
    const youtubeEmbedUrl = `https://www.youtube.com/embed/${cleanId}`;

    return (
        <PermissionGuard requiredPermission={requiredPermission} targetPath={link}>
            <div className="max-w-7xl mx-auto p-4">
                <Card className="overflow-hidden shadow-lg rounded-lg">
                    <CardContent className="p-6">
                        <h3 className="text-2xl font-bold mb-2">{title}</h3>
                        <p className="text-gray-600 mb-6">{description}</p>

                        {/* YouTube Video Embed */}
                        <div className="relative w-full h-0 pb-[56.25%]"> {/* 16:9 Aspect Ratio */}
                            <iframe
                                src={youtubeEmbedUrl}
                                title={title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                            ></iframe>
                        </div>

                        <div className="mt-6">
                            <Button variant="outline" asChild>
                                <a href={link}>View More Videos</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PermissionGuard>
    );
}
