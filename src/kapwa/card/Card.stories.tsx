import type { Meta, StoryObj } from '@storybook/react';

import { Card, CardContent, CardImage } from '.';
import { Button } from '../button';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className='w-96'>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <CardImage
          src='https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg'
          alt='Article thumbnail'
        />
        <CardContent>
          <span className='bg-primary-100 text-primary-800 mb-2 inline-block rounded-sm px-2 py-1 text-xs font-medium'>
            News
          </span>
          <h3 className='mb-2 text-xl font-semibold'>
            Digital Government Initiatives
          </h3>
          <p className='mb-4 text-gray-800'>
            Latest updates on the government&apos;s digital transformation
            projects and e-services.
          </p>
          <Button variant='link'>Read More</Button>
        </CardContent>
      </div>
    ),
  },
};
