import { FC, useEffect, useState } from 'react';
import { Calendar, ExternalLinkIcon, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardGrid, CardImage } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { config } from '@/lib/lguConfig';

interface LGUNewsPost {
  title: string;
  url: string;
  date: string;
  excerpt: string;
  imageUrl: string;
}

interface LGUNewsResponse {
  posts: LGUNewsPost[];
  source: string;
  cached: boolean;
}

const NewsSection: FC = () => {
  const { t } = useTranslation('common');
  const [posts, setPosts] = useState<LGUNewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/lgu-news');
        const data: LGUNewsResponse = await response.json();
        setPosts(data.posts);
      } catch {
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className='bg-kapwa-bg-surface py-12'>
      <div className='container mx-auto px-4'>
        <div className='mb-8 flex items-center justify-between'>
          <h2 className='text-kapwa-text-strong kapwa-heading-lg font-bold'>
            {t('news.title')}
          </h2>
          <a
            href='https://losbanos.gov.ph/all'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center font-medium text-kapwa-text-brand transition-colors hover:text-kapwa-text-brand'
          >
            View All Posts
            <ExternalLinkIcon className='ml-1 h-4 w-4' />
          </a>
        </div>

        {loading ? (
          <CardGrid columns={3}>
            {[1, 2, 3].map(i => (
              <Card key={i} className='animate-pulse overflow-hidden'>
                <div className='h-48 bg-kapwa-bg-muted' />
                <CardContent>
                  <div className='h-4 w-1/3 rounded bg-kapwa-bg-muted' />
                  <div className='mt-3 h-6 w-full rounded bg-kapwa-bg-muted' />
                  <div className='mt-2 h-4 w-full rounded bg-kapwa-bg-muted' />
                </CardContent>
              </Card>
            ))}
          </CardGrid>
        ) : error ? (
          <div className='rounded-lg border border-kapwa-border-danger bg-kapwa-bg-danger-weak p-6 text-center'>
            <AlertCircle className='mx-auto h-8 w-8 text-kapwa-text-danger' />
            <p className='mt-2 text-kapwa-text-muted'>
              Unable to load news at this time.
            </p>
          </div>
        ) : (
          <CardGrid columns={3}>
            {(posts ?? []).map(post => (
              <Card
                key={post.url}
                className='overflow-hidden transition-shadow hover:shadow-lg'
              >
                <CardImage src={post.imageUrl} alt={post.title} />
                <CardContent>
                  <Badge variant='outline'>{config.lgu.name}</Badge>
                  <div className='mt-2 flex items-center gap-1.5 text-sm text-kapwa-text-muted'>
                    <Calendar className='h-3.5 w-3.5' />
                    <span>{post.date}</span>
                  </div>
                  <h3 className='mt-2 line-clamp-2 text-lg font-semibold text-kapwa-text-strong'>
                    {post.title}
                  </h3>
                  <p className='mt-1 line-clamp-3 text-sm text-kapwa-text-muted'>
                    {post.excerpt}
                  </p>
                  <a
                    href={post.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-3 inline-flex items-center text-sm font-medium text-kapwa-text-brand hover:underline'
                  >
                    Read More
                    <ExternalLinkIcon className='ml-1 h-3.5 w-3.5' />
                  </a>
                </CardContent>
              </Card>
            ))}
          </CardGrid>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
