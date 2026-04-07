import { PageHero } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

/**
 * Reference Implementation Page
 *
 * This page demonstrates proper design system patterns and serves as a reference
 * for implementing other pages in BetterLB. It showcases:
 * - Kapwa semantic token usage
 * - Proper component composition
 * - Responsive layout patterns
 * - Accessibility best practices
 */
export default function ReferenceImplementation() {
  return (
    <div className='min-h-screen bg-kapwa-bg-surface'>
      <PageHero
        title='Reference Implementation'
        subtitle='Demonstrates design system patterns'
        className='bg-kapwa-bg-surface-bold border-kapwa-border-weak'
      />

      <main className='container mx-auto px-kapwa-md py-kapwa-lg'>
        <div className='grid gap-kapwa-md md:grid-cols-2 lg:grid-cols-3'>
          {/* Card Example 1: Basic Card */}
          <Card className='bg-kapwa-bg-surface border-kapwa-border-weak'>
            <CardHeader>
              <h3 className='kapwa-heading-md text-kapwa-text-strong'>
                Basic Card
              </h3>
            </CardHeader>
            <CardContent>
              <p className='kapwa-body-md text-kapwa-text-support'>
                This card demonstrates proper semantic token usage with Kapwa
                design system tokens for colors, typography, and spacing.
              </p>
            </CardContent>
          </Card>

          {/* Card Example 2: Status Card */}
          <Card className='bg-kapwa-bg-surface border-kapwa-border-weak'>
            <CardHeader>
              <h3 className='kapwa-heading-md text-kapwa-text-strong'>
                Status Indicators
              </h3>
            </CardHeader>
            <CardContent>
              <p className='kapwa-body-md text-kapwa-text-support mb-kapwa-sm'>
                Semantic tokens for status and feedback:
              </p>
              <div className='flex flex-col gap-kapwa-sm'>
                <span className='text-kapwa-text-success kapwa-body-sm'>
                  ✓ Success state
                </span>
                <span className='text-kapwa-text-warning kapwa-body-sm'>
                  ⚠ Warning state
                </span>
                <span className='text-kapwa-text-danger kapwa-body-sm'>
                  ✕ Error state
                </span>
                <span className='text-kapwa-text-info kapwa-body-sm'>
                  ℹ Info state
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card Example 3: Typography Scale */}
          <Card className='bg-kapwa-bg-surface border-kapwa-border-weak'>
            <CardHeader>
              <h3 className='kapwa-heading-md text-kapwa-text-strong'>
                Typography Scale
              </h3>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col gap-kapwa-md'>
                <p className='kapwa-heading-lg text-kapwa-text-strong'>
                  Heading Large
                </p>
                <p className='kapwa-heading-md text-kapwa-text-strong'>
                  Heading Medium
                </p>
                <p className='kapwa-body-lg text-kapwa-text-support'>
                  Body Large text for emphasis
                </p>
                <p className='kapwa-body-md text-kapwa-text-support'>
                  Body Medium standard text
                </p>
                <p className='kapwa-body-sm text-kapwa-text-disabled'>
                  Body Small muted text
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card Example 4: Spacing System */}
          <Card className='bg-kapwa-bg-surface border-kapwa-border-weak'>
            <CardHeader>
              <h3 className='kapwa-heading-md text-kapwa-text-strong'>
                Spacing Tokens
              </h3>
            </CardHeader>
            <CardContent>
              <p className='kapwa-body-md text-kapwa-text-support mb-kapwa-sm'>
                Kapwa spacing scale follows 4px base unit:
              </p>
              <div className='flex flex-col gap-kapwa-sm'>
                <div className='bg-kapwa-bg-surface-raised p-kapwa-sm'>
                  Small padding (kapwa-sm)
                </div>
                <div className='bg-kapwa-bg-surface-raised p-kapwa-md'>
                  Medium padding (kapwa-md)
                </div>
                <div className='bg-kapwa-bg-surface-raised p-kapwa-lg'>
                  Large padding (kapwa-lg)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Example 5: Border Variants */}
          <Card className='bg-kapwa-bg-surface border-kapwa-border-weak'>
            <CardHeader>
              <h3 className='kapwa-heading-md text-kapwa-text-strong'>
                Border Variants
              </h3>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col gap-kapwa-md'>
                <div className='border-kapwa-border-weak border p-kapwa-md'>
                  Weak border (subtle)
                </div>
                <div className='border-kapwa-border-default border p-kapwa-md'>
                  Default border
                </div>
                <div className='border-kapwa-border-strong border p-kapwa-md'>
                  Strong border (prominent)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Example 6: Interactive States */}
          <Card className='bg-kapwa-bg-surface border-kapwa-border-weak'>
            <CardHeader>
              <h3 className='kapwa-heading-md text-kapwa-text-strong'>
                Interactive States
              </h3>
            </CardHeader>
            <CardContent>
              <p className='kapwa-body-md text-kapwa-text-support mb-kapwa-sm'>
                Links use semantic link colors:
              </p>
              <a
                href='#'
                className='text-kapwa-text-link hover:text-kapwa-text-link-hover kapwa-body-md'
              >
                Link text (hover to see state)
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Code Example Section */}
        <section className='mt-kapwa-xl'>
          <h2 className='kapwa-heading-lg text-kapwa-text-strong mb-kapwa-md'>
            Implementation Patterns
          </h2>
          <Card className='bg-kapwa-bg-surface border-kapwa-border-weak'>
            <CardContent className='p-kapwa-lg'>
              <h3 className='kapwa-heading-md text-kapwa-text-strong mb-kapwa-sm'>
                DO: Use Semantic Tokens
              </h3>
              <pre className='bg-kapwa-bg-surface-bold border-kapwa-border-weak border p-kapwa-md text-kapwa-text-inverse kapwa-body-sm overflow-x-auto rounded-lg'>
                {`// ✅ Correct - Semantic tokens
<div className="bg-kapwa-bg-surface border-kapwa-border-weak">
  <h2 className="kapwa-heading-md text-kapwa-text-strong">
    Title
  </h2>
  <p className="kapwa-body-md text-kapwa-text-support">
    Description
  </p>
</div>`}
              </pre>
            </CardContent>
          </Card>

          <Card className='bg-kapwa-bg-surface border-kapwa-border-weak mt-kapwa-md'>
            <CardContent className='p-kapwa-lg'>
              <h3 className='kapwa-heading-md text-kapwa-text-strong mb-kapwa-sm'>
                DON&apos;T: Use Raw Colors
              </h3>
              <pre className='bg-kapwa-bg-surface-bold border-kapwa-border-weak border p-kapwa-md text-kapwa-text-inverse kapwa-body-sm overflow-x-auto rounded-lg'>
                {`// ❌ Wrong - Raw color classes
<div className="bg-white border-gray-200">
  <h2 className="text-xl font-semibold text-slate-900">
    Title
  </h2>
  <p className="text-base text-slate-600">
    Description
  </p>
</div>`}
              </pre>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
