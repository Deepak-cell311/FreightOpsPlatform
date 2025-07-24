import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  ThumbsUp, 
  ThumbsDown, 
  Clock,
  Users
} from "lucide-react";

export function SupportKnowledge() {
  const knowledgeBaseArticles = [
    {
      id: 1,
      title: "Getting Started with FreightOps",
      category: "Getting Started",
      views: 1250,
      likes: 45,
      dislikes: 3,
      lastUpdated: "2025-01-08",
      status: "published",
      author: "Sarah Johnson"
    },
    {
      id: 2,
      title: "Setting Up Fleet Management",
      category: "Fleet Management",
      views: 890,
      likes: 32,
      dislikes: 1,
      lastUpdated: "2025-01-07",
      status: "published",
      author: "Mike Wilson"
    },
    {
      id: 3,
      title: "Dispatch System Configuration",
      category: "Dispatch",
      views: 756,
      likes: 28,
      dislikes: 2,
      lastUpdated: "2025-01-06",
      status: "published",
      author: "Lisa Davis"
    },
    {
      id: 4,
      title: "Banking Integration Setup",
      category: "Banking",
      views: 642,
      likes: 24,
      dislikes: 0,
      lastUpdated: "2025-01-05",
      status: "draft",
      author: "John Smith"
    },
    {
      id: 5,
      title: "Troubleshooting Common Issues",
      category: "Troubleshooting",
      views: 1125,
      likes: 51,
      dislikes: 5,
      lastUpdated: "2025-01-04",
      status: "published",
      author: "Sarah Johnson"
    }
  ];

  const categories = [
    { name: "Getting Started", count: 12, color: "bg-blue-100 text-blue-800" },
    { name: "Fleet Management", count: 8, color: "bg-green-100 text-green-800" },
    { name: "Dispatch", count: 6, color: "bg-purple-100 text-purple-800" },
    { name: "Banking", count: 4, color: "bg-yellow-100 text-yellow-800" },
    { name: "Troubleshooting", count: 10, color: "bg-red-100 text-red-800" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600">Manage support documentation and help articles</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Search Articles
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold text-blue-600">40</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-green-600">12,450</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-purple-600">35</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-yellow-600">4.8/5</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <span className="text-sm font-medium">{category.name}</span>
                  <Badge className={category.color}>
                    {category.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Articles List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Articles</CardTitle>
              <div className="flex items-center space-x-2">
                <Input placeholder="Search articles..." className="w-64" />
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {knowledgeBaseArticles.map((article) => (
                <div key={article.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{article.title}</h3>
                        <Badge className={getStatusColor(article.status)}>
                          {article.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span>Category: {article.category}</span>
                        <span>Author: {article.author}</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Updated: {article.lastUpdated}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.views} views</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{article.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <ThumbsDown className="w-4 h-4" />
                          <span>{article.dislikes}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}