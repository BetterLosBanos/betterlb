import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, CheckCircle2 } from 'lucide-react'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Government Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access official government services quickly and easily. Find what
            you need for citizenship, business, education, and more.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <SearchInput
            placeholder="Search for services..."
            onSearch={handleSearch}
            icon={<Search className="h-5 w-5 text-gray-400" />}
            size="lg"
          />
        </div>

        <div className="flex gap-8">
          {/* Categories Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <ScrollArea.Root className="h-[calc(100vh-400px)]">
                <ScrollArea.Viewport className="h-full w-full">
                  <div className="space-y-1 pr-4">
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategorySlug === 'all'
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      All Services
                    </button>
                    {(serviceCategories.categories as Category[]).map(
                      (category) => (
                        <div key={category.slug}>
                          <button
                            onClick={() => handleCategoryChange(category.slug)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                              selectedCategorySlug === category.slug
                                ? 'bg-primary-50 text-primary-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {category.category}
                          </button>

                          {selectedCategorySlug === category.slug && (
                            <div className="ml-4 space-y-1 mt-1">
                              {category.subcategories.map((subcategory) => (
                                <button
                                  key={subcategory.slug}
                                  onClick={() =>
                                    handleSubcategoryChange(subcategory.slug)
                                  }
                                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                                    selectedSubcategorySlug === subcategory.slug
                                      ? 'bg-primary-50 text-primary-600 font-medium'
                                      : 'text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {subcategory.name}
                                </button>
                              ))}
                            </div>
                          )}
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
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginatedServices.map((service, index) => (
                <Card key={index} hoverable className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {service.service}
                        </h3>
                        <div className="mt-2 space-x-2">
                          <Link
                            to={`/services?category=${
                              (serviceCategories.categories as Category[]).find(
                                (cat) => cat.category === service.category
                              )?.slug || ''
                            }`}
                            className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
                          >
                            {service.category}
                          </Link>
                          <Link
                            to={`/services?category=${
                              (serviceCategories.categories as Category[]).find(
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
                      <CheckCircle2 className="h-5 w-5 text-success-500 flex-shrink-0" />
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
                        <span>Last verified: {formatDate(new Date())}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {filteredServices.length > ITEMS_PER_PAGE * currentPage && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Load More Services
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
