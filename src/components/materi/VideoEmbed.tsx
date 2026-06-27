interface VideoEmbedProps {
  url: string;
  provider: 'YOUTUBE' | 'VIMEO';
}

export default function VideoEmbed({ url, provider }: VideoEmbedProps) {
  const getEmbedUrl = () => {
    if (provider === 'YOUTUBE') {
      const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^?&]+)/);
      if (videoIdMatch) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
      }
    } else if (provider === 'VIMEO') {
      const videoIdMatch = url.match(/vimeo\.com\/(\d+)/);
      if (videoIdMatch) {
        return `https://player.vimeo.com/video/${videoIdMatch[1]}`;
      }
    }
    return url;
  };

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden">
      <iframe
        src={getEmbedUrl()}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
}
