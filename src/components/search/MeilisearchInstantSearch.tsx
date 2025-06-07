import React, { useState } from 'react'
import {
  InstantSearch,
  SearchBox,
  Hits,
  Highlight,
  Snippet,
  Configure,
  Stats,
} from 'react-instantsearch'
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'
import 'instantsearch.css/themes/satellite.css' // Or your preferred theme
import './MeilisearchInstantSearch.css' // For custom styles

const MEILISEARCH_HOST =
  import.meta.env.VITE_MEILISEARCH_HOST || 'http://localhost'
const MEILISEARCH_PORT = import.meta.env.VITE_MEILISEARCH_PORT || '7700'
const MEILISEARCH_SEARCH_API_KEY =
  import.meta.env.VITE_MEILISEARCH_SEARCH_API_KEY ||
  'your_public_search_key_here'

const { searchClient } = instantMeiliSearch(
  `${MEILISEARCH_HOST}:${MEILISEARCH_PORT}`,
  MEILISEARCH_SEARCH_API_KEY,
  {
    primaryKey: 'slug',
    keepZeroFacets: true,
    meiliSearchParams: {
      attributesToHighlight: [
        'name',
        'office_name',
        'office',
        'service',
        'description',
      ],
      // highlightPreTag: '<em>',
      // highlightPostTag: '</em>',
      attributesToSearchOn: [
        'name',
        'office_name',
        'office',
        'service',
        'website',
        'description',
        'category',
        'subcategory',
        'address',
      ],
    },
  }
)

interface HitProps {
  hit: {
    // [key: string]: any // Allow any string keys for hit attributes
    // objectID: string
    name?: string
    office_name?: string
    office?: string
    service?: string
    website?: string
    category?:
      | string
      | {
          name: string
          slug: string
        }
    address?: string
    subcategory?:
      | string
      | {
          name: string
          slug: string
        }
    description?: string
    slug?: string
    url?: string
    // Add other fields you expect in your search results
  }
}

const Hit: React.FC<HitProps> = ({ hit }) => {
  const title = hit.service || hit.name || hit.office_name || hit.office
  const link = hit.url || `/directory/${hit.slug}`

  return (
    <article className="hit-item p-4 border-b border-gray-200 hover:bg-gray-50">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <h2 className="text-lg font-semibold text-blue-600 hover:underline">
          {title}
          {/* <Highlight
            attribute={
              hit.service
                ? 'service'
                : hit.name
                ? 'name'
                : hit.office_name
                ? 'office_name'
                : 'office'
            }
            hit={hit as any}
          /> */}
        </h2>
        {hit.description && (
          <p className="text-sm text-gray-600 mt-1">
            <Snippet attribute="description" hit={hit as any} />
          </p>
        )}
        <div className="text-xs text-gray-500">
          {hit.category && (
            <span>
              <Highlight
                attribute={hit.category?.name ? 'category.name' : 'category'}
                hit={hit as any}
              />
              {' > '}
            </span>
          )}
          {hit.subcategory && (
            <span>
              <Highlight
                attribute={
                  hit.subcategory?.name ? 'subcategory.name' : 'subcategory'
                }
                hit={hit as any}
              />{' '}
            </span>
          )}
          {hit.address && (
            <span>
              <Highlight attribute="address" hit={hit as any} />
              {' > '}
            </span>
          )}
        </div>
        {(hit.url || hit.website) && (
          <p className="text-xs text-blue-500 mt-1 truncate">
            {hit.url || hit.website}
          </p>
        )}
      </a>
    </article>
  )
}

const MeilisearchInstantSearch: React.FC = () => {
  const [hasInteracted, setHasInteracted] = useState(false)
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="bettergov"
      initialUiState={{
        bettergov: {
          query: undefined,
          hitsPerPage: 4,
        },
      }}
    >
      <Configure hitsPerPage={10} />
      <div className="ais-InstantSearch">
        <div className="mb-2 w-full">
          <SearchBox
            placeholder="Search for services, directory items..."
            className="w-full"
            onFocus={() => setHasInteracted(true)}
            classNames={{
              root: 'mb-2',
              form: 'relative',
              input:
                'w-full p-3 pl-10 border border-gray-300  focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-150 ease-in-out',
              submit:
                'absolute top-0 right-0 h-full px-3 text-gray-500 hover:text-blue-600',
              reset:
                'absolute top-0 right-8 h-full px-3 text-gray-400 hover:text-gray-600',
            }}
          />

          {hasInteracted && (
            <div className="bg-white rounded-lg shadow overflow-y-scroll h-96 absolute z-30 w-1/2">
              <Stats
                classNames={{
                  root: 'text-sm text-gray-600 p-2 text-right text-xs',
                }}
              />
              <Hits
                hitComponent={Hit}
                className="w-full"
                classNames={{
                  list: 'w-full p-0',
                  item: 'w-full  py-0 px-0 border-none',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </InstantSearch>
  )
}

export default MeilisearchInstantSearch
