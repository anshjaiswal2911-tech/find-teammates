# 📤 Contribute Resources Feature Guide

## Overview

Enable community members to suggest and add new resources to the Resource Hub.

---

## Component: AddResourceModal.tsx

```typescript
// src/app/components/AddResourceModal.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { dbService } from '../lib/dbService';
import { Resource } from '../lib/types';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResourceAdded?: (resource: Resource) => void;
}

const categories = ['GitHub', 'YouTube', 'Docs', 'Course', 'Blog'];
const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
const languages = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese'];

export function AddResourceModal({ isOpen, onClose, onResourceAdded }: AddResourceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    category: 'GitHub' as const,
    difficulty: 'Intermediate' as const,
    language: 'English' as const,
    author: '',
    duration: '',
    tags: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.link.trim()) {
      setError('Link is required');
      return false;
    }
    if (!isValidUrl(formData.link)) {
      setError('Please enter a valid URL');
      return false;
    }
    if (formData.title.length < 5) {
      setError('Title must be at least 5 characters');
      return false;
    }
    if (formData.title.length > 200) {
      setError('Title must be less than 200 characters');
      return false;
    }
    return true;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      const resource = await dbService.addResource({
        title: formData.title.trim(),
        description: formData.description.trim(),
        link: formData.link.trim(),
        category: formData.category as any,
        tags,
        author: formData.author.trim(),
        difficulty: formData.difficulty as any,
        language: formData.language,
        duration: formData.duration.trim(),
        upvotes: 0,
        createdBy: 'community',
      });

      if (resource) {
        setSuccess(true);
        setTimeout(() => {
          setFormData({
            title: '',
            description: '',
            link: '',
            category: 'GitHub',
            difficulty: 'Intermediate',
            language: 'English',
            author: '',
            duration: '',
            tags: '',
          });
          setSuccess(false);
          onResourceAdded?.(resource);
          onClose();
        }, 2000);
      } else {
        setError('Failed to add resource. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while adding the resource.');
      console.error('Error adding resource:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Share a Resource
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Success!</p>
                      <p className="text-sm text-green-700">
                        Your resource has been added to the hub.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-900">Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Resource Title *
                    </label>
                    <Input
                      type="text"
                      name="title"
                      placeholder="e.g., React 18 Complete Guide"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.title.length}/200 characters
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      placeholder="Brief description of the resource..."
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none"
                    />
                  </div>

                  {/* Link */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Link *
                    </label>
                    <Input
                      type="url"
                      name="link"
                      placeholder="https://..."
                      value={formData.link}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>

                  {/* Category & Difficulty */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      >
                        {difficulties.map(diff => (
                          <option key={diff} value={diff}>
                            {diff}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Language & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      >
                        {languages.map(lang => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Duration
                      </label>
                      <Input
                        type="text"
                        name="duration"
                        placeholder="e.g., 10 hours, 6 weeks"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Author */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Author/Creator
                    </label>
                    <Input
                      type="text"
                      name="author"
                      placeholder="e.g., Traversy Media"
                      value={formData.author}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <Input
                      type="text"
                      name="tags"
                      placeholder="React, Frontend, JavaScript, Hooks"
                      value={formData.tags}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate tags with commas for better searchability
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Resource
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Thank you for contributing! Your resource will be reviewed and added soon.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

## Integration into Resources.tsx

```typescript
import { useState } from 'react';
import { AddResourceModal } from '../components/AddResourceModal';

export function Resources() {
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  // ... existing code ...

  const handleResourceAdded = (resource: Resource) => {
    // Refresh resources list
    setResources(prev => [resource, ...prev]);
  };

  return (
    <DashboardLayout>
      {/* Existing header */}

      {/* Add "Contribute" Button */}
      <motion.div className="mb-8 flex gap-4">
        <Button
          onClick={() => setIsAddResourceOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Share a Resource
        </Button>
      </motion.div>

      {/* Modal */}
      <AddResourceModal
        isOpen={isAddResourceOpen}
        onClose={() => setIsAddResourceOpen(false)}
        onResourceAdded={handleResourceAdded}
      />

      {/* Existing resources grid */}
    </DashboardLayout>
  );
}
```

---

## Validation Rules

### Title
- Required field
- Minimum 5 characters
- Maximum 200 characters
- No special characters allowed (except hyphens, commas, colons)

### Link
- Required field
- Must be valid URL starting with http:// or https://
- Must be accessible and not blocked

### Category
- Required field
- Must be one of: GitHub, YouTube, Docs, Course, Blog

### Tags
- Optional, but recommended (3-5 tags)
- Separated by commas
- Converted to lowercase for consistency
- No special characters

### Description
- Optional
- Maximum 500 characters
- Should provide context about the resource

### Author
- Optional but recommended
- Name of creator/publisher
- Maximum 100 characters

### Duration
- Optional
- Format: "10 hours", "6 weeks", "90 minutes"
- Helps users decide if it's worth their time

---

## Database Service Method

```typescript
async addResource(resource: Partial<Resource>): Promise<Resource | null> {
  try {
    const user = await getCurrentUser();

    const { data, error } = await supabase
      .from('resources')
      .insert({
        title: resource.title,
        description: resource.description || null,
        link: resource.link,
        category: resource.category,
        tags: resource.tags || [],
        difficulty: resource.difficulty || null,
        duration: resource.duration || null,
        author: resource.author || null,
        language: resource.language || 'English',
        thumbnail_url: null, // Can be generated later
        source: null,
        upvotes: 0,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding resource:', error);
      return null;
    }

    return {
      ...data,
      createdAt: new Date(data.created_at),
    };
  } catch (error) {
    console.error('Error in addResource:', error);
    return null;
  }
}
```

---

## Moderation Strategy

### Automatic Filtering
```typescript
// Check for spam/inappropriate content
const hasSpamContent = (text: string): boolean => {
  const spamPatterns = [
    /viagra|casino|lottery/gi,
    /<script|<iframe/gi,
    /http:\/\/.*\.(xyz|tk|ml)/gi,
  ];

  return spamPatterns.some(pattern => pattern.test(text));
};

// In addResource:
if (hasSpamContent(resource.title) || hasSpamContent(resource.description)) {
  throw new Error('Resource contains inappropriate content');
}
```

### Admin Review
- Resources submitted by new/unverified users go into queue
- Approved resources appear immediately
- Rejected resources notify user with reason

---

## Future Enhancements

### Phase 1
- ✅ Basic form submission
- ✅ Validation
- ✅ Database storage
- ✅ Success/error messages

### Phase 2
- [ ] Admin moderation dashboard
- [ ] Resource preview before submission
- [ ] Duplicate detection
- [ ] Community voting on submissions
- [ ] Email notifications

### Phase 3
- [ ] Link preview/metadata extraction
- [ ] Automatic thumbnail generation
- [ ] Content analysis for classification
- [ ] Spam detection ML model
- [ ] User reputation system

---

## Tips for Contributors

```markdown
## Guidelines for Contributing Resources

1. **Quality First**
   - Ensure resource is genuinely useful
   - Check for broken links
   - Verify content is up-to-date

2. **Accurate Metadata**
   - Use clear, descriptive titles
   - Select appropriate difficulty level
   - Add relevant tags (3-5)
   - Mention author/creator

3. **Helpful Descriptions**
   - Explain what the resource teaches
   - Mention prerequisites
   - Highlight unique features
   - Include time commitment

4. **Appropriate Category**
   - GitHub: Open source projects, code samples
   - YouTube: Video tutorials, talks
   - Docs: Official documentation, guides
   - Course: Structured learning programs
   - Blog: Articles, tutorials, insights

5. **Community Standards**
   - No self-promotion of low-quality content
   - No spam or phishing links
   - No duplicate submissions
   - Respect copyright and licensing

Thank you for making the community better! 🙏
```

---

This system enables collaborative resource curation while maintaining quality through validation and moderation! 🚀
