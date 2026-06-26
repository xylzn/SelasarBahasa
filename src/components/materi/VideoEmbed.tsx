interface VideoEmbedProps {
  url: string;
  provider: 'YOUTUBE' | 'VIMEO' | null;
}

export default function VideoEmbed({ url, provider }: VideoEmbedProps) {
  let embedUrl = url;

  if (provider === 'YOUTUBE') {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (match) {
      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }
  } else if (provider === 'VIMEO') {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
      embedUrl = `https://player.vimeo.com/video/${match[1]}`;
    }
  }

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
      <iframe
        src={embedUrl}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
