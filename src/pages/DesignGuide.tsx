import React from 'react';
import { Card, CardHeader, CardContent, CardImage } from '../components/ui/Card';
import Button from '../components/ui/Button';
import SearchInput from '../components/ui/SearchInput';
import { Search, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

const ColorBlock = ({ color, name, value }: { color: string; name: string; value: string }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-12 h-12 rounded ${color}`} />
    <div>
      <div className="font-medium">{name}</div>
      <div className="text-sm text-gray-500">{value}</div>
    </div>
  </div>
);

const TypographyExample = ({ className, label }: { className: string; label: string }) => (
  <div className="mb-4">
    <div className={className}>The quick brown fox jumps over the lazy dog</div>
    <div className="text-sm text-gray-500 mt-1">{label}</div>
  </div>
);

const DesignGuide: React.FC = () => {
  const searchResults = [
    { id: 1, title: 'National ID Registration', category: 'Citizenship' },
    { id: 2, title: 'Business Permit Application', category: 'Business' },
    { id: 3, title: 'Passport Renewal', category: 'Travel' },
  ];

  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Pending' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Design Guidelines</h1>

        {/* Typography Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Typography</h2>
            <p className="text-gray-600">Plus Jakarta Sans is our primary font family</p>
          </CardHeader>
          <CardContent>
            <TypographyExample className="text-4xl font-bold" label="Heading 1 - text-4xl font-bold" />
            <TypographyExample className="text-3xl font-semibold" label="Heading 2 - text-3xl font-semibold" />
            <TypographyExample className="text-2xl font-medium" label="Heading 3 - text-2xl font-medium" />
            <TypographyExample className="text-xl" label="Heading 4 - text-xl" />
            <TypographyExample className="text-base" label="Body - text-base" />
            <TypographyExample className="text-sm" label="Small - text-sm" />
          </CardContent>
        </Card>

        {/* Colors Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Colors</h2>
            <p className="text-gray-600">Our color palette</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-4">Primary</h3>
                <div className="space-y-4">
                  <ColorBlock color="bg-primary-500" name="Primary 500" value="#0066eb" />
                  <ColorBlock color="bg-primary-600" name="Primary 600" value="#0052bc" />
                  <ColorBlock color="bg-primary-700" name="Primary 700" value="#003d8d" />
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-4">Secondary</h3>
                <div className="space-y-4">
                  <ColorBlock color="bg-secondary-500" name="Secondary 500" value="#ff4d00" />
                  <ColorBlock color="bg-secondary-600" name="Secondary 600" value="#cc3e00" />
                  <ColorBlock color="bg-secondary-700" name="Secondary 700" value="#992e00" />
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-4">Accent</h3>
                <div className="space-y-4">
                  <ColorBlock color="bg-accent-500" name="Accent 500" value="#f58900" />
                  <ColorBlock color="bg-accent-600" name="Accent 600" value="#c46e00" />
                  <ColorBlock color="bg-accent-700" name="Accent 700" value="#935200" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lists Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Lists</h2>
            <p className="text-gray-600">Different list styles and search results</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Search Results List */}
              <div>
                <h3 className="font-medium mb-4">Search Results</h3>
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{result.title}</h4>
                          <span className="inline-block px-2 py-1 mt-2 text-xs font-medium rounded bg-gray-100 text-gray-600">
                            {result.category}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tables Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Tables</h2>
            <p className="text-gray-600">Table styles for data presentation</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{row.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{row.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          row.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : row.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Article Components */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Article Components</h2>
            <p className="text-gray-600">Article cards and content styles</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Article Card */}
              <div>
                <h3 className="font-medium mb-4">Article Card</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardImage
                      src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg"
                      alt="Article thumbnail"
                    />
                    <CardContent>
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 mb-2">
                        News
                      </span>
                      <h3 className="text-xl font-semibold mb-2">Digital Government Initiatives</h3>
                      <p className="text-gray-600 mb-4">
                        Latest updates on the government's digital transformation projects and e-services.
                      </p>
                      <Button variant="link">Read More</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <div className="relative">
                      <CardImage
                        src="https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg"
                        alt="Article with overlay"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex items-end p-6">
                        <div className="text-white">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-white/20 mb-2">
                            Tourism
                          </span>
                          <h3 className="text-xl font-semibold mb-2">Exploring Philippine Islands</h3>
                          <p className="text-white/80">
                            Discover the beauty of the Philippine archipelago.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Article Content */}
              <div>
                <h3 className="font-medium mb-4">Article Content</h3>
                <div className="prose max-w-none">
                  <h1 className="text-3xl font-bold mb-4">Article Title</h1>
                  <p className="text-gray-600 mb-6">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua.
                  </p>
                  <h2 className="text-2xl font-semibold mb-3">Section Heading</h2>
                  <p className="text-gray-600 mb-4">
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                    ex ea commodo consequat.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Profile Components</h2>
            <p className="text-gray-600">Profile card and information display</p>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="relative h-48">
                  <img
                    src="https://images.pexels.com/photos/1714455/pexels-photo-1714455.jpeg"
                    alt="Profile cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="relative px-6 pb-6">
                  <div className="flex items-end mb-4">
                    <div className="relative -mt-16 mr-4">
                      <img
                        src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-white object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">Ferdinand Marcos Jr.</h3>
                      <p className="text-gray-600">President of the Republic of the Philippines</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      The 17th President of the Philippines, serving since June 30, 2022.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span>Malacañang Palace, Manila</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-5 w-5 mr-2" />
                        <span>+63 (2) 8736 8645</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-5 w-5 mr-2" />
                        <span>op@president.gov.ph</span>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <Button>Contact</Button>
                      <Button variant="outline">View Profile</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesignGuide;