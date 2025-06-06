import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, CheckCircle2, Menu, X } from 'lucide-react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { Card, CardContent } from '../../components/ui/Card'
import SearchInput from '../../components/ui/SearchInput'
import serviceCategories from '../../data/service_categories.json'
import services from '../../data/services.json'
import { formatDate } from '../../lib/utils'

interface Subcategory {
  name: string
  slug: string
}

interface Category {
  category: string
  slug: string
  subcategories: Subcategory[]
}

const ITEMS_PER_PAGE = 12

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all')
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Set initial category and subcategory from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const subcategoryParam = searchParams.get('subcategory')

    if (categoryParam) {
      setSelectedCategorySlug(categoryParam)
    }
    if (subcategoryParam) {
      setSelectedSubcategorySlug(subcategoryParam)
    }
  }, [searchParams])

  // Find selected category object
  const selectedCategory = useMemo(() => {
    if (selectedCategorySlug === 'all') return null
    return (serviceCategories.categories as Category[]).find(
      (cat) => cat.slug === selectedCategorySlug
    )
  }, [selectedCategorySlug])

  // Find selected subcategory object
  const selectedSubcategory = useMemo(() => {
    if (!selectedCategory || selectedSubcategorySlug === 'all') return null
    return selectedCategory.subcategories.find(
      (subcat) => subcat.slug === selectedSubcategorySlug
    )
  }, [selectedCategory, selectedSubcategorySlug])

  const filteredServices = useMemo(() => {
    let filtered = services

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (service) =>
          service.service.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.subcategory.toLowerCase().includes(query)
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (service) => service.category === selectedCategory.category
      )

      if (selectedSubcategory) {
        filtered = filtered.filter(
          (service) => service.subcategory === selectedSubcategory.name
        )
      }
    }

    return filtered
  }, [searchQuery, selectedCategory, selectedSubcategory])

  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategorySlug(categorySlug)
    setSelectedSubcategorySlug('all')
    setCurrentPage(1)
    setSearchParams(categorySlug === 'all' ? {} : { category: categorySlug })
  }

  const handleSubcategoryChange = (subcategorySlug: string) => {
    setSelectedSubcategorySlug(subcategorySlug)
    setCurrentPage(1)
    setSearchParams(
      subcategorySlug === 'all'
        ? { category: selectedCategorySlug }
        : { category: selectedCategorySlug, subcategory: subcategorySlug }
    )
  }

  // const currentCategoryData = selectedCategory

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Government Services
          </h1>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
            Access official government services quickly and easily. Find what
            you need for citizenship, business, education, and more.
          </p>
        </header>

        {/* Search Bar */}
        <section
          aria-label="Search services"
          className="max-w-2xl mx-auto mb-8 md:mb-12"
        >
          <SearchInput
            placeholder="Search for services..."
            onSearch={handleSearch}
            icon={<Search className="h-5 w-5 text-gray-400" />}
            size="lg"
            aria-label="Search government services"
            role="searchbox"
          />
          <p className="sr-only" id="search-description">
            Search for government services by name, category, or description
          </p>
        </section>

        {/* Mobile Category Toggle */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg shadow-sm text-gray-900 font-medium"
            aria-expanded={sidebarOpen}
            aria-controls="categories-sidebar"
            aria-label={`${sidebarOpen ? 'Close' : 'Open'} categories menu`}
          >
            <span>
              Categories{' '}
              {selectedCategorySlug !== 'all' &&
                `(${selectedCategory?.category})`}
            </span>
            {sidebarOpen ? (
              <X className="h-5 w-5 text-gray-600" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Categories Sidebar */}
          <div
            id="categories-sidebar"
            className={`${
              sidebarOpen ? 'block' : 'hidden'
            } md:block w-full md:w-64 md:flex-shrink-0 mb-6 md:mb-0`}
            role="navigation"
            aria-label="Service categories"
          >
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 mb-4 text-lg">
                Categories
              </h2>
              <ScrollArea.Root className="h-[calc(60vh)] md:h-[calc(100vh-400px)]">
                <ScrollArea.Viewport className="h-full w-full">
                  <div className="space-y-1 pr-4" role="list">
                    <div role="listitem">
                      <button
                        onClick={() => {
                          handleCategoryChange('all')
                          setSidebarOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategorySlug === 'all'
                            ? 'bg-primary-50 text-primary-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        aria-current={
                          selectedCategorySlug === 'all' ? 'true' : undefined
                        }
                      >
                        All Services
                        {selectedCategorySlug === 'all' && (
                          <span className="sr-only"> (selected)</span>
                        )}
                      </button>
                    </div>
                    {(serviceCategories.categories as Category[]).map(
                      (category) => (
                        <div key={category.slug} role="listitem">
                          <button
                            onClick={() => {
                              handleCategoryChange(category.slug)
                              setSidebarOpen(false)
                            }}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                              selectedCategorySlug === category.slug
                                ? 'bg-primary-50 text-primary-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            aria-expanded={
                              selectedCategorySlug === category.slug
                            }
                            aria-controls={`subcategory-${category.slug}`}
                            aria-current={
                              selectedCategorySlug === category.slug
                                ? 'true'
                                : undefined
                            }
                          >
                            {category.category}
                            {selectedCategorySlug === category.slug && (
                              <span className="sr-only"> (selected)</span>
                            )}
                          </button>

                          <div
                            id={`subcategory-${category.slug}`}
                            className={`ml-4 space-y-1 mt-1 ${
                              selectedCategorySlug === category.slug
                                ? 'block'
                                : 'hidden'
                            }`}
                            role="region"
                            aria-label={`${category.category} subcategories`}
                          >
                            {category.subcategories.map((subcategory) => (
                              <button
                                key={subcategory.slug}
                                onClick={() => {
                                  handleSubcategoryChange(subcategory.slug)
                                  setSidebarOpen(false)
                                }}
                                className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                                  selectedSubcategorySlug === subcategory.slug
                                    ? 'bg-primary-50 text-primary-600 font-medium'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                                aria-current={
                                  selectedSubcategorySlug === subcategory.slug
                                    ? 'true'
                                    : undefined
                                }
                              >
                                {subcategory.name}
                                {selectedSubcategorySlug ===
                                  subcategory.slug && (
                                  <span className="sr-only"> (selected)</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar
                  className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors hover:bg-gray-200 rounded-full"
                  orientation="vertical"
                >
                  <ScrollArea.Thumb className="flex-1 bg-gray-300 rounded-full relative" />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
            </div>
          </div>

          {/* Services Grid */}
          <main className="flex-1">
            <h2 className="sr-only">Available Services</h2>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
              role="list"
              aria-label="List of government services"
            >
              {paginatedServices.map((service, index) => (
                <article key={index} className="h-full" role="listitem">
                  <Card hoverable className="bg-white h-full">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {service.service}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Link
                              to={`/services?category=${
                                (
                                  serviceCategories.categories as Category[]
                                ).find(
                                  (cat) => cat.category === service.category
                                )?.slug || ''
                              }`}
                              className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
                            >
                              {service.category}
                            </Link>
                            <Link
                              to={`/services?category=${
                                (
                                  serviceCategories.categories as Category[]
                                ).find(
                                  (cat) => cat.category === service.category
                                )?.slug || ''
                              }&subcategory=${
                                (serviceCategories.categories as Category[])
                                  .find(
                                    (cat) => cat.category === service.category
                                  )
                                  ?.subcategories.find(
                                    (subcat) =>
                                      subcat.name === service.subcategory
                                  )?.slug || ''
                              }`}
                              className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                            >
                              {service.subcategory}
                            </Link>
                          </div>
                        </div>
                        <CheckCircle2
                          className="h-5 w-5 text-success-500 flex-shrink-0"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="space-y-3">
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 text-sm hover:text-primary-600 transition-colors break-all"
                        >
                          {service.url}
                        </a>
                        <div className="flex items-center text-sm text-gray-500">
                          <time
                            dateTime={new Date().toISOString()}
                            className="text-xs md:text-sm"
                          >
                            Last verified: {formatDate(new Date())}
                          </time>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            {filteredServices.length > ITEMS_PER_PAGE * currentPage && (
              <div className="mt-6 md:mt-8 text-center">
                <button
                  onClick={() => {
                    setCurrentPage((prev) => prev + 1)
                    // Focus management for better keyboard navigation
                    setTimeout(() => {
                      const nextPageFirstItem = document.querySelector(
                        '[role="listitem"]:last-child'
                      )
                      if (nextPageFirstItem instanceof HTMLElement) {
                        nextPageFirstItem.focus()
                      }
                    }, 100)
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 md:px-6 md:py-3 border border-transparent text-sm md:text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  aria-label={`Load more services, showing ${Math.min(
                    filteredServices.length - currentPage * ITEMS_PER_PAGE,
                    ITEMS_PER_PAGE
                  )} of ${
                    filteredServices.length - currentPage * ITEMS_PER_PAGE
                  } remaining`}
                >
                  Load More Services
                </button>
              </div>
            )}

            {/* Status message for screen readers */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              Showing{' '}
              {Math.min(paginatedServices.length, ITEMS_PER_PAGE * currentPage)}{' '}
              of {filteredServices.length} services
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
