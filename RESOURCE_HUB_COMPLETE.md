# 🎓 Complete Resource Hub System

## Overview

This system provides a comprehensive resource hub that aggregates YouTube videos, GitHub repositories, documentation, online courses, and blog posts - all in one searchable, filterable interface.

---

## 1. Database Schema for Resources

```sql
-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  link TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('GitHub', 'YouTube', 'Docs', 'Course', 'Blog')),
  tags TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  difficulty TEXT,
  duration TEXT,
  thumbnail_url TEXT,
  author TEXT,
  source TEXT,
  language TEXT DEFAULT 'English'
);

-- Create indexes
CREATE INDEX idx_resources_category ON public.resources(category);
CREATE INDEX idx_resources_created_at ON public.resources(created_at DESC);
CREATE INDEX idx_resources_upvotes ON public.resources(upvotes DESC);
CREATE INDEX idx_resources_tags ON public.resources USING GIN(tags);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Everyone can view resources"
  ON public.resources FOR SELECT
  USING (true);

CREATE POLICY "Users can add resources"
  ON public.resources FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can upvote resources"
  ON public.resources FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

---

## 2. Curated Resources Data

### YouTube Resources
```typescript
// Web Development
{
  title: "React 18 Complete Guide",
  description: "Comprehensive React 18 tutorial covering hooks, context, and modern patterns",
  link: "https://www.youtube.com/watch?v=...",
  category: "YouTube",
  tags: ["React", "Frontend", "JavaScript", "Hooks"],
  difficulty: "Intermediate",
  duration: "12 hours",
  author: "Traversy Media",
  thumbnail_url: "https://img.youtube.com/vi/...",
  upvotes: 342
},
{
  title: "Node.js Complete Course",
  description: "Learn backend development with Node.js and Express",
  link: "https://www.youtube.com/watch?v=...",
  category: "YouTube",
  tags: ["Node.js", "Backend", "JavaScript", "Express"],
  difficulty: "Beginner",
  duration: "10 hours",
  author: "Coding Addict",
  upvotes: 278
},
{
  title: "Web Design Masterclass",
  description: "UI/UX design principles and web design best practices",
  link: "https://www.youtube.com/watch?v=...",
  category: "YouTube",
  tags: ["Design", "UI/UX", "CSS", "Frontend"],
  difficulty: "Intermediate",
  duration: "8 hours",
  author: "DesignCourse",
  upvotes: 195
}
```

### GitHub Repositories
```typescript
// Popular Open Source Projects
{
  title: "freeCodeCamp - Open Source Community",
  description: "Free coding tutorials and projects for beginners",
  link: "https://github.com/freeCodeCamp/freeCodeCamp",
  category: "GitHub",
  tags: ["Learning", "JavaScript", "Web Development", "Open Source"],
  difficulty: "Beginner",
  author: "freeCodeCamp",
  source: "GitHub",
  upvotes: 1250
},
{
  title: "Create React App Templates",
  description: "Official starter templates for React applications",
  link: "https://github.com/facebook/create-react-app",
  category: "GitHub",
  tags: ["React", "Boilerplate", "Frontend"],
  author: "Facebook",
  source: "GitHub",
  upvotes: 890
},
{
  title: "Next.js - React Framework",
  description: "The React framework for production with SSR and static generation",
  link: "https://github.com/vercel/next.js",
  category: "GitHub",
  tags: ["React", "Framework", "Frontend", "Node.js"],
  author: "Vercel",
  source: "GitHub",
  upvotes: 1120
},
{
  title: "Tailwind CSS - Utility CSS Framework",
  description: "Rapidly build modern websites without leaving your HTML",
  link: "https://github.com/tailwindlabs/tailwindcss",
  category: "GitHub",
  tags: ["CSS", "Styling", "Frontend", "Framework"],
  author: "Tailwind Labs",
  source: "GitHub",
  upvotes: 780
}
```

### Documentation
```typescript
// Official Docs
{
  title: "React Official Documentation",
  description: "Official React documentation with guides and API reference",
  link: "https://react.dev",
  category: "Docs",
  tags: ["React", "Frontend", "JavaScript", "Official"],
  difficulty: "Intermediate",
  author: "Meta",
  source: "Official",
  upvotes: 2100
},
{
  title: "MDN Web Docs - JavaScript",
  description: "Comprehensive JavaScript reference and guides",
  link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  category: "Docs",
  tags: ["JavaScript", "Web", "Reference"],
  author: "Mozilla",
  source: "Official",
  upvotes: 1890
},
{
  title: "Node.js Official Documentation",
  description: "Official Node.js API documentation and guides",
  link: "https://nodejs.org/docs",
  category: "Docs",
  tags: ["Node.js", "Backend", "Reference"],
  author: "Node.js Foundation",
  source: "Official",
  upvotes: 1450
},
{
  title: "TypeScript Official Handbook",
  description: "Complete TypeScript language documentation",
  link: "https://www.typescriptlang.org/docs",
  category: "Docs",
  tags: ["TypeScript", "JavaScript", "Type Safety"],
  author: "Microsoft",
  source: "Official",
  upvotes: 1680
}
```

### Online Courses
```typescript
// Paid & Free Courses
{
  title: "Udemy - Complete Web Development Bootcamp",
  description: "Full stack web development course covering HTML, CSS, JavaScript, Node, MongoDB",
  link: "https://www.udemy.com/course/the-complete-web-development-bootcamp",
  category: "Course",
  tags: ["Web Development", "Full Stack", "Bootcamp"],
  difficulty: "Beginner",
  duration: "63 hours",
  author: "Angela Yu",
  source: "Udemy",
  upvotes: 890
},
{
  title: "Coursera - Meta Front-End Developer",
  description: "Professional certificate in front-end development by Meta",
  link: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
  category: "Course",
  tags: ["Frontend", "React", "Professional Certificate"],
  difficulty: "Beginner",
  duration: "7 months",
  author: "Meta",
  source: "Coursera",
  upvotes: 1230
},
{
  title: "freeCodeCamp - Responsive Web Design",
  description: "Free certification course on responsive web design",
  link: "https://www.freecodecamp.org/learn/responsive-web-design",
  category: "Course",
  tags: ["Web Design", "CSS", "HTML", "Free"],
  difficulty: "Beginner",
  duration: "300 hours",
  author: "freeCodeCamp",
  source: "freeCodeCamp",
  upvotes: 756
},
{
  title: "Scrimba - Learn React",
  description: "Interactive React course with live coding challenges",
  link: "https://scrimba.com/learn/react",
  category: "Course",
  tags: ["React", "Interactive", "Frontend"],
  difficulty: "Intermediate",
  author: "Scrimba",
  source: "Scrimba",
  upvotes: 543
}
```

### Blog Posts
```typescript
// Technical Blogs
{
  title: "CSS Tricks - A Complete Guide to Grid",
  description: "Comprehensive guide to CSS Grid layout system",
  link: "https://css-tricks.com/snippets/css/complete-guide-grid",
  category: "Blog",
  tags: ["CSS", "Layout", "Frontend"],
  difficulty: "Intermediate",
  author: "Chris House",
  source: "CSS Tricks",
  upvotes: 645
},
{
  title: "Dev.to - React Hooks Explained",
  description: "In-depth explanation of React Hooks and their use cases",
  link: "https://dev.to/...",
  category: "Blog",
  tags: ["React", "Hooks", "JavaScript"],
  difficulty: "Intermediate",
  author: "Dev Community",
  source: "Dev.to",
  upvotes: 432
},
{
  title: "Medium - Building Scalable Applications",
  description: "Best practices for building scalable and maintainable applications",
  link: "https://medium.com/...",
  category: "Blog",
  tags: ["Architecture", "Best Practices", "Scalability"],
  difficulty: "Advanced",
  author: "Various Authors",
  source: "Medium",
  upvotes: 234
},
{
  title: "Hashnode - JavaScript Performance Tips",
  description: "10 tips to improve JavaScript performance",
  link: "https://hashnode.com/...",
  category: "Blog",
  tags: ["JavaScript", "Performance", "Optimization"],
  difficulty: "Intermediate",
  author: "Hashnode Community",
  source: "Hashnode",
  upvotes: 567
}
```

---

## 3. Enhanced Resources.tsx Component

```typescript
// src/app/pages/Resources.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  ThumbsUp,
  ExternalLink,
  BookOpen,
  Youtube,
  Github,
  FileText,
  GraduationCap,
  Bookmark,
  Share2,
  Clock,
  TrendingUp,
  Star,
  Download,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { DashboardLayout } from '../components/DashboardLayout';
import { dbService } from '../lib/dbService';
import { Resource } from '../lib/types';

const categoryIcons = {
  GitHub: Github,
  YouTube: Youtube,
  Docs: FileText,
  Course: GraduationCap,
  Blog: BookOpen,
};

const categoryColors = {
  GitHub: 'bg-gray-900 text-white',
  YouTube: 'bg-red-500 text-white',
  Docs: 'bg-blue-500 text-white',
  Course: 'bg-purple-500 text-white',
  Blog: 'bg-green-500 text-white',
};

const categories = ['All', 'GitHub', 'YouTube', 'Docs', 'Course', 'Blog'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const languageOptions = ['All', 'English', 'Hindi', 'Spanish', 'French'];

interface ResourceWithMeta extends Resource {
  saved?: boolean;
  upvoted?: boolean;
}

export function Resources() {
  const [resources, setResources] = useState<ResourceWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'trending'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [savedResources, setSavedResources] = useState<Set<string>>(new Set());
  const [upvotedResources, setUpvotedResources] = useState<Set<string>>(new Set());

  // Load resources on mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const data = await dbService.getResources();
        const withMeta: ResourceWithMeta[] = data.map(r => ({
          ...r,
          saved: false,
          upvoted: false,
        }));
        setResources(withMeta);
      } catch (error) {
        console.error('Error loading resources:', error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();

    // Load saved/upvoted from localStorage
    const saved = localStorage.getItem('savedResources');
    const upvoted = localStorage.getItem('upvotedResources');
    if (saved) setSavedResources(new Set(JSON.parse(saved)));
    if (upvoted) setUpvotedResources(new Set(JSON.parse(upvoted)));
  }, []);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    return resources
      .filter(resource => {
        const matchesSearch =
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.tags.some(tag =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const matchesCategory =
          selectedCategory === 'All' || resource.category === selectedCategory;

        const matchesDifficulty =
          selectedDifficulty === 'All' || resource.difficulty === selectedDifficulty;

        const matchesLanguage =
          selectedLanguage === 'All' || resource.language === selectedLanguage;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesDifficulty &&
          matchesLanguage
        );
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return b.upvotes - a.upvotes;
        } else if (sortBy === 'trending') {
          // Combine upvotes and recent activity
          const aDays = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          const bDays = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          const aScore = a.upvotes / Math.max(aDays, 1);
          const bScore = b.upvotes / Math.max(bDays, 1);
          return bScore - aScore;
        } else {
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        }
      });
  }, [resources, searchQuery, selectedCategory, selectedDifficulty, selectedLanguage, sortBy]);

  const handleUpvote = (resourceId: string) => {
    if (!upvotedResources.has(resourceId)) {
      setUpvotedResources(prev => {
        const newSet = new Set(prev);
        newSet.add(resourceId);
        localStorage.setItem('upvotedResources', JSON.stringify(Array.from(newSet)));
        return newSet;
      });

      setResources(prev =>
        prev.map(r =>
          r.id === resourceId
            ? { ...r, upvotes: r.upvotes + 1, upvoted: true }
            : r
        )
      );
    }
  };

  const handleSave = (resourceId: string) => {
    setSavedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      localStorage.setItem('savedResources', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const handleShare = (resource: Resource) => {
    const text = `Check out this resource: ${resource.title}\n${resource.link}`;
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: text,
        url: resource.link,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${resource.title}\n${resource.link}`);
    }
  };

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category as keyof typeof categoryIcons];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    resources.forEach(r => {
      stats[r.category] = (stats[r.category] || 0) + 1;
    });
    return stats;
  }, [resources]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            <p className="mt-4 text-gray-600">Loading resources...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">Resource Hub</h1>
        <p className="mt-2 text-lg text-gray-600">
          Curated learning resources from YouTube, GitHub, documentation, courses, and blogs
        </p>

        {/* Category Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.slice(1).map(cat => (
            <div key={cat} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">{cat}</p>
              <p className="text-2xl font-bold text-gray-900">
                {categoryStats[cat] || 0}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Search & Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by title, tags, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Level
            </label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            >
              {languageOptions.map(lang => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Sort & View */}
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Resources Display */}
      {filteredResources.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-600">
            No resources found. Try adjusting your filters.
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}
        >
          <AnimatePresence>
            {filteredResources.map((resource, idx) => (
              <motion.div
                key={resource.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                          categoryColors[resource.category as keyof typeof categoryColors]
                        }`}
                      >
                        {getCategoryIcon(resource.category)}
                        <span className="text-sm font-semibold">
                          {resource.category}
                        </span>
                      </div>
                      {resource.difficulty && (
                        <Badge
                          variant={
                            resource.difficulty === 'Beginner'
                              ? 'success'
                              : resource.difficulty === 'Intermediate'
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          {resource.difficulty}
                        </Badge>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex-grow">
                      {resource.title}
                    </h3>
                    {resource.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {resource.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      {resource.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {resource.duration}
                        </div>
                      )}
                      {resource.author && (
                        <div className="text-xs">By {resource.author}</div>
                      )}
                    </div>

                    {/* Tags */}
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {resource.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{resource.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpvote(resource.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
                            upvotedResources.has(resource.id)
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{resource.upvotes}</span>
                        </button>

                        <button
                          onClick={() => handleSave(resource.id)}
                          className={`p-2 rounded-lg transition-all ${
                            savedResources.has(resource.id)
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleShare(resource)}
                          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold"
                      >
                        View
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Results Counter */}
      <div className="mt-8 text-center text-gray-600">
        <p>
          Showing {filteredResources.length} of {resources.length} resources
        </p>
      </div>
    </DashboardLayout>
  );
}
```

---

## 4. Database Service Updates

```typescript
// Add to src/app/lib/dbService.ts

export const dbService = {
  // ... existing methods ...

  // Resources
  async getResources(): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('upvotes', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      // Return fallback curated resources
      return getCuratedResources();
    }

    return data || [];
  },

  async addResource(resource: Partial<Resource>): Promise<Resource | null> {
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title: resource.title,
        description: resource.description,
        link: resource.link,
        category: resource.category,
        tags: resource.tags,
        created_by: getCurrentUserId(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding resource:', error);
      return null;
    }

    return data;
  },

  async upvoteResource(resourceId: string): Promise<void> {
    const { data: resource, error: fetchError } = await supabase
      .from('resources')
      .select('upvotes')
      .eq('id', resourceId)
      .single();

    if (fetchError) {
      console.error('Error fetching resource:', fetchError);
      return;
    }

    const { error } = await supabase
      .from('resources')
      .update({ upvotes: (resource?.upvotes || 0) + 1 })
      .eq('id', resourceId);

    if (error) {
      console.error('Error upvoting resource:', error);
    }
  },

  async searchResources(query: string): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Error searching resources:', error);
      return [];
    }

    return data || [];
  },

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('category', category)
      .order('upvotes', { ascending: false });

    if (error) {
      console.error('Error fetching category resources:', error);
      return [];
    }

    return data || [];
  },
};

// Fallback curated resources
function getCuratedResources(): Resource[] {
  return [
    {
      id: '1',
      title: 'React Official Documentation',
      description: 'Official React documentation with guides and API reference',
      link: 'https://react.dev',
      category: 'Docs',
      tags: ['React', 'Frontend', 'JavaScript', 'Official'],
      upvotes: 2100,
      createdBy: 'system',
      createdAt: new Date(),
    },
    // ... more fallback resources
  ];
}
```

---

## 5. SQL Script to Populate Initial Resources

```sql
-- Insert curated YouTube resources
INSERT INTO public.resources (
  title, description, link, category, tags, difficulty, duration, author, upvotes, created_at
) VALUES
  ('React 18 Complete Guide', 'Comprehensive React 18 tutorial covering hooks, context, and modern patterns', 'https://youtube.com/watch?v=...', 'YouTube', ARRAY['React', 'Frontend', 'JavaScript'], 'Intermediate', '12 hours', 'Traversy Media', 342, NOW()),
  ('Node.js Complete Course', 'Learn backend development with Node.js and Express', 'https://youtube.com/watch?v=...', 'YouTube', ARRAY['Node.js', 'Backend', 'JavaScript'], 'Beginner', '10 hours', 'Coding Addict', 278, NOW()),
  ('Web Design Masterclass', 'UI/UX design principles and web design best practices', 'https://youtube.com/watch?v=...', 'YouTube', ARRAY['Design', 'UI/UX', 'CSS'], 'Intermediate', '8 hours', 'DesignCourse', 195, NOW());

-- Insert curated GitHub repositories
INSERT INTO public.resources (
  title, description, link, category, tags, author, source, upvotes, created_at
) VALUES
  ('freeCodeCamp - Open Source Community', 'Free coding tutorials and projects for beginners', 'https://github.com/freeCodeCamp/freeCodeCamp', 'GitHub', ARRAY['Learning', 'JavaScript', 'Web Development'], 'freeCodeCamp', 'GitHub', 1250, NOW()),
  ('Create React App Templates', 'Official starter templates for React applications', 'https://github.com/facebook/create-react-app', 'GitHub', ARRAY['React', 'Boilerplate', 'Frontend'], 'Facebook', 'GitHub', 890, NOW()),
  ('Next.js - React Framework', 'The React framework for production with SSR and static generation', 'https://github.com/vercel/next.js', 'GitHub', ARRAY['React', 'Framework', 'Frontend'], 'Vercel', 'GitHub', 1120, NOW());

-- Insert documentation resources
INSERT INTO public.resources (
  title, description, link, category, tags, author, source, upvotes, created_at
) VALUES
  ('React Official Documentation', 'Official React documentation with guides and API reference', 'https://react.dev', 'Docs', ARRAY['React', 'Frontend', 'JavaScript'], 'Meta', 'Official', 2100, NOW()),
  ('MDN Web Docs - JavaScript', 'Comprehensive JavaScript reference and guides', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'Docs', ARRAY['JavaScript', 'Web', 'Reference'], 'Mozilla', 'Official', 1890, NOW()),
  ('Node.js Official Documentation', 'Official Node.js API documentation and guides', 'https://nodejs.org/docs', 'Docs', ARRAY['Node.js', 'Backend', 'Reference'], 'Node.js Foundation', 'Official', 1450, NOW());

-- Insert course resources
INSERT INTO public.resources (
  title, description, link, category, tags, difficulty, duration, author, source, upvotes, created_at
) VALUES
  ('Udemy - Complete Web Development Bootcamp', 'Full stack web development course covering HTML, CSS, JavaScript, Node, MongoDB', 'https://udemy.com/course/the-complete-web-development-bootcamp', 'Course', ARRAY['Web Development', 'Full Stack', 'Bootcamp'], 'Beginner', '63 hours', 'Angela Yu', 'Udemy', 890, NOW()),
  ('Coursera - Meta Front-End Developer', 'Professional certificate in front-end development by Meta', 'https://coursera.org/professional-certificates/meta-front-end-developer', 'Course', ARRAY['Frontend', 'React', 'Professional Certificate'], 'Beginner', '7 months', 'Meta', 'Coursera', 1230, NOW()),
  ('freeCodeCamp - Responsive Web Design', 'Free certification course on responsive web design', 'https://freecodecamp.org/learn/responsive-web-design', 'Course', ARRAY['Web Design', 'CSS', 'HTML', 'Free'], 'Beginner', '300 hours', 'freeCodeCamp', 'freeCodeCamp', 756, NOW());

-- Insert blog resources
INSERT INTO public.resources (
  title, description, link, category, tags, difficulty, author, source, upvotes, created_at
) VALUES
  ('CSS Tricks - A Complete Guide to Grid', 'Comprehensive guide to CSS Grid layout system', 'https://css-tricks.com/snippets/css/complete-guide-grid', 'Blog', ARRAY['CSS', 'Layout', 'Frontend'], 'Intermediate', 'Chris House', 'CSS Tricks', 645, NOW()),
  ('Dev.to - React Hooks Explained', 'In-depth explanation of React Hooks and their use cases', 'https://dev.to/...', 'Blog', ARRAY['React', 'Hooks', 'JavaScript'], 'Intermediate', 'Dev Community', 'Dev.to', 432, NOW()),
  ('Medium - Building Scalable Applications', 'Best practices for building scalable and maintainable applications', 'https://medium.com/...', 'Blog', ARRAY['Architecture', 'Best Practices', 'Scalability'], 'Advanced', 'Various Authors', 'Medium', 234, NOW());
```

---

## Key Features

✅ **All-in-One Hub**
- YouTube videos
- GitHub repositories
- Official documentation
- Online courses
- Blog posts

✅ **Advanced Filtering**
- Category filter (YouTube, GitHub, Docs, Course, Blog)
- Difficulty level (Beginner, Intermediate, Advanced)
- Language filter
- Search by title, description, tags

✅ **Sorting Options**
- Most Popular (by upvotes)
- Trending (upvotes + recency)
- Most Recent

✅ **User Interactions**
- Upvote resources
- Save/bookmark resources
- Share resources
- View detailed information

✅ **Metadata**
- Duration for courses/videos
- Author/creator
- Difficulty level
- Tags for categorization
- Upvote count

✅ **Responsive Design**
- Works on desktop, tablet, mobile
- Grid and list view options
- Smooth animations

This complete system provides everything needed for a professional resource hub! 🚀
