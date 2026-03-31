/**
 * Comprehensive Curated Resources Data
 * Includes YouTube, GitHub, Docs, Courses, and Blogs
 * src/app/lib/seedResources.ts
 */

import { Resource } from './types';
import { supabase } from './supabase';

export const curatedResources: Omit<Resource, 'id' | 'createdAt'>[] = [
  // ============ YOUTUBE RESOURCES ============
  {
    title: 'React 18 Complete Guide',
    description: 'Comprehensive React 18 tutorial covering hooks, context, and modern patterns from beginner to advanced',
    link: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
    category: 'YouTube',
    tags: ['React', 'Frontend', 'JavaScript', 'Hooks', 'State Management'],
    upvotes: 342,
    createdBy: 'system',
    difficulty: 'Intermediate',
    duration: '12 hours',
    author: 'Traversy Media',
    language: 'English',
    thumbnail_url: 'https://img.youtube.com/vi/SqcY0GlETPk/maxresdefault.jpg',
    source: 'YouTube',
  },
  {
    title: 'Node.js Complete Course for Beginners',
    description: 'Learn backend development with Node.js, Express, and MongoDB. Perfect for beginners',
    link: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4',
    category: 'YouTube',
    tags: ['Node.js', 'Backend', 'JavaScript', 'Express', 'MongoDB'],
    upvotes: 278,
    createdBy: 'system',
    difficulty: 'Beginner',
    duration: '7 hours',
    author: 'Coding Addict',
    language: 'English',
    source: 'YouTube',
  },
  {
    title: 'Web Design Masterclass 2024',
    description: 'Master UI/UX design principles, web design best practices, and modern design tools',
    link: 'https://www.youtube.com/watch?v=jX3XbS3A0-E',
    category: 'YouTube',
    tags: ['Design', 'UI/UX', 'CSS', 'Frontend', 'Web Design'],
    upvotes: 195,
    createdBy: 'system',
    difficulty: 'Intermediate',
    duration: '8 hours',
    author: 'DesignCourse',
    language: 'English',
    source: 'YouTube',
  },
  {
    title: 'TypeScript for Beginners',
    description: 'Complete TypeScript tutorial for JavaScript developers. Learn types, interfaces, and generics',
    link: 'https://www.youtube.com/watch?v=SBmSRK3feww',
    category: 'YouTube',
    tags: ['TypeScript', 'JavaScript', 'Type Safety', 'Frontend'],
    upvotes: 245,
    createdBy: 'system',
    difficulty: 'Intermediate',
    duration: '6 hours',
    author: 'Traversy Media',
    language: 'English',
    source: 'YouTube',
  },
  {
    title: 'Full Stack JavaScript Project Walkthrough',
    description: 'Build a complete full-stack application with React, Node.js, and MongoDB from scratch',
    link: 'https://www.youtube.com/watch?v=PBTYxXAFOVs',
    category: 'YouTube',
    tags: ['Full Stack', 'React', 'Node.js', 'MongoDB', 'Project'],
    upvotes: 312,
    createdBy: 'system',
    difficulty: 'Advanced',
    duration: '10 hours',
    author: 'freeCodeCamp',
    language: 'English',
    source: 'YouTube',
  },
  {
    title: 'CSS Grid and Flexbox Mastery',
    description: 'Learn CSS Grid and Flexbox layouts to build responsive web designs',
    link: 'https://www.youtube.com/watch?v=9zBsdzdE4sQ',
    category: 'YouTube',
    tags: ['CSS', 'Layout', 'Responsive Design', 'Frontend'],
    upvotes: 289,
    createdBy: 'system',
    difficulty: 'Intermediate',
    duration: '4 hours',
    author: 'Traversy Media',
    language: 'English',
    source: 'YouTube',
  },
  {
    title: 'JavaScript ES6+ Features Deep Dive',
    description: 'Master modern JavaScript features: arrow functions, destructuring, async/await, and more',
    link: 'https://www.youtube.com/watch?v=JBwXbzJZPAA',
    category: 'YouTube',
    tags: ['JavaScript', 'ES6', 'Modern JavaScript', 'Tutorial'],
    upvotes: 267,
    createdBy: 'system',
    difficulty: 'Intermediate',
    duration: '5 hours',
    author: 'Traversy Media',
    language: 'English',
    source: 'YouTube',
  },
  {
    title: 'Python for Beginners - Complete Course',
    description: 'Learn Python programming from scratch. Variables, loops, functions, OOP, and more',
    link: 'https://www.youtube.com/watch?v=rfscVS0vtik',
    category: 'YouTube',
    tags: ['Python', 'Programming', 'Beginner', 'Tutorial'],
    upvotes: 234,
    createdBy: 'system',
    difficulty: 'Beginner',
    duration: '4 hours',
    author: 'Traversy Media',
    language: 'English',
    source: 'YouTube',
  },
  {
    title: 'Database Design for Web Applications',
    description: 'Learn how to design efficient databases: normalization, indexing, relationships',
    link: 'https://www.youtube.com/watch?v=ztHopE5Wnpc',
    category: 'YouTube',
    tags: ['Database', 'SQL', 'Backend', 'System Design'],
    upvotes: 198,
    createdBy: 'system',
    difficulty: 'Advanced',
    duration: '3 hours',
    author: 'Hussein Nasser',
    language: 'English',
    source: 'YouTube',
  },

  // ============ GITHUB REPOSITORIES ============
  {
    title: 'freeCodeCamp - Open Source Community',
    description: 'Massive collection of free coding tutorials, projects, and resources for beginners',
    link: 'https://github.com/freeCodeCamp/freeCodeCamp',
    category: 'GitHub',
    tags: ['Learning', 'JavaScript', 'Web Development', 'Open Source', 'Courses'],
    upvotes: 1250,
    createdBy: 'system',
    author: 'freeCodeCamp',
    language: 'English',
    source: 'GitHub',
  },
  {
    title: 'Create React App - Official Templates',
    description: 'Official Create React App repository with starter templates and boilerplates',
    link: 'https://github.com/facebook/create-react-app',
    category: 'GitHub',
    tags: ['React', 'Boilerplate', 'Frontend', 'JavaScript', 'Templates'],
    upvotes: 890,
    createdBy: 'system',
    author: 'Facebook (Meta)',
    language: 'English',
    source: 'GitHub',
  },
  {
    title: 'Next.js - React Framework for Production',
    description: 'Full-featured React framework with SSR, static generation, and API routes',
    link: 'https://github.com/vercel/next.js',
    category: 'GitHub',
    tags: ['React', 'Framework', 'Frontend', 'JavaScript', 'TypeScript', 'SSR'],
    upvotes: 1120,
    createdBy: 'system',
    author: 'Vercel',
    language: 'English',
    source: 'GitHub',
  },
  {
    title: 'Tailwind CSS - Utility-First CSS Framework',
    description: 'Rapidly build modern websites without leaving your HTML',
    link: 'https://github.com/tailwindlabs/tailwindcss',
    category: 'GitHub',
    tags: ['CSS', 'Styling', 'Frontend', 'Framework', 'Utility-First'],
    upvotes: 780,
    createdBy: 'system',
    author: 'Tailwind Labs',
    language: 'English',
    source: 'GitHub',
  },
  {
    title: 'TypeScript - Language and Compiler',
    description: 'Official TypeScript repository. Typed superset of JavaScript',
    link: 'https://github.com/microsoft/TypeScript',
    category: 'GitHub',
    tags: ['TypeScript', 'JavaScript', 'Type Safety', 'Language'],
    upvotes: 945,
    createdBy: 'system',
    author: 'Microsoft',
    language: 'English',
    source: 'GitHub',
  },
  {
    title: 'Vue.js - Progressive JavaScript Framework',
    description: 'Approachable, performant, and versatile framework for building user interfaces',
    link: 'https://github.com/vuejs/vue',
    category: 'GitHub',
    tags: ['Vue.js', 'Frontend', 'JavaScript', 'Framework'],
    upvotes: 712,
    createdBy: 'system',
    author: 'Evan You',
    language: 'English',
    source: 'GitHub',
  },
  {
    title: 'Node.js - JavaScript Runtime',
    description: 'Official Node.js repository. Server-side JavaScript runtime',
    link: 'https://github.com/nodejs/node',
    category: 'GitHub',
    tags: ['Node.js', 'Backend', 'JavaScript', 'Runtime'],
    upvotes: 834,
    createdBy: 'system',
    author: 'OpenJS Foundation',
    language: 'English',
    source: 'GitHub',
  },
  {
    title: 'Express.js - Minimal Web Framework',
    description: 'Fast, unopinionated, minimal web framework for Node.js',
    link: 'https://github.com/expressjs/express',
    category: 'GitHub',
    tags: ['Express', 'Node.js', 'Backend', 'Web Framework'],
    upvotes: 678,
    createdBy: 'system',
    author: 'TJ Holowaychuk',
    language: 'English',
    source: 'GitHub',
  },
  {
    title: 'MongoDB Node.js Driver',
    description: 'Official MongoDB Node.js driver for database operations',
    link: 'https://github.com/mongodb/node-mongodb-native',
    category: 'GitHub',
    tags: ['MongoDB', 'Node.js', 'Database', 'Driver'],
    upvotes: 523,
    createdBy: 'system',
    author: 'MongoDB',
    language: 'English',
    source: 'GitHub',
  },
  {
    title: 'Webpack - JavaScript Module Bundler',
    description: 'Powerful module bundler for building modern web applications',
    link: 'https://github.com/webpack/webpack',
    category: 'GitHub',
    tags: ['Bundler', 'JavaScript', 'Build Tools', 'Frontend'],
    upvotes: 645,
    createdBy: 'system',
    author: 'Tobias Koppers',
    language: 'English',
    source: 'GitHub',
  },

  // ============ DOCUMENTATION ============
  {
    title: 'React Official Documentation',
    description: 'Complete React documentation including guides, API reference, and hooks documentation',
    link: 'https://react.dev',
    category: 'Docs',
    tags: ['React', 'Frontend', 'JavaScript', 'Official Documentation'],
    upvotes: 2100,
    createdBy: 'system',
    author: 'Meta',
    language: 'English',
    source: 'Official',
  },
  {
    title: 'MDN Web Docs - JavaScript',
    description: 'Comprehensive JavaScript reference, guides, and tutorials from Mozilla',
    link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    category: 'Docs',
    tags: ['JavaScript', 'Web', 'Reference', 'MDN'],
    upvotes: 1890,
    createdBy: 'system',
    author: 'Mozilla',
    language: 'English',
    source: 'Official',
  },
  {
    title: 'Node.js Official Documentation',
    description: 'Complete Node.js API documentation, guides, and best practices',
    link: 'https://nodejs.org/docs',
    category: 'Docs',
    tags: ['Node.js', 'Backend', 'Reference', 'Official'],
    upvotes: 1450,
    createdBy: 'system',
    author: 'Node.js Foundation',
    language: 'English',
    source: 'Official',
  },
  {
    title: 'TypeScript Official Handbook',
    description: 'Complete TypeScript language documentation and handbook',
    link: 'https://www.typescriptlang.org/docs',
    category: 'Docs',
    tags: ['TypeScript', 'JavaScript', 'Type Safety', 'Reference'],
    upvotes: 1680,
    createdBy: 'system',
    author: 'Microsoft',
    language: 'English',
    source: 'Official',
  },
  {
    title: 'MDN Web Docs - CSS',
    description: 'Comprehensive CSS reference, guides, and tutorials',
    link: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
    category: 'Docs',
    tags: ['CSS', 'Frontend', 'Reference', 'MDN'],
    upvotes: 1256,
    createdBy: 'system',
    author: 'Mozilla',
    language: 'English',
    source: 'Official',
  },
  {
    title: 'Express.js Documentation',
    description: 'Official Express.js documentation with guides and API reference',
    link: 'https://expressjs.com',
    category: 'Docs',
    tags: ['Express', 'Node.js', 'Backend', 'Web Framework'],
    upvotes: 834,
    createdBy: 'system',
    author: 'Express.js Community',
    language: 'English',
    source: 'Official',
  },
  {
    title: 'MongoDB Documentation',
    description: 'Complete MongoDB documentation, guides, and tutorials',
    link: 'https://docs.mongodb.com',
    category: 'Docs',
    tags: ['MongoDB', 'Database', 'NoSQL', 'Reference'],
    upvotes: 1023,
    createdBy: 'system',
    author: 'MongoDB Inc',
    language: 'English',
    source: 'Official',
  },
  {
    title: 'Tailwind CSS Documentation',
    description: 'Complete Tailwind CSS documentation with examples and configuration',
    link: 'https://tailwindcss.com/docs',
    category: 'Docs',
    tags: ['Tailwind', 'CSS', 'Frontend', 'Documentation'],
    upvotes: 945,
    createdBy: 'system',
    author: 'Tailwind Labs',
    language: 'English',
    source: 'Official',
  },
  {
    title: 'PostgreSQL Official Documentation',
    description: 'Complete PostgreSQL documentation for database management',
    link: 'https://www.postgresql.org/docs',
    category: 'Docs',
    tags: ['PostgreSQL', 'Database', 'SQL', 'Reference'],
    upvotes: 789,
    createdBy: 'system',
    author: 'PostgreSQL Global Development Group',
    language: 'English',
    source: 'Official',
  },

  // ============ ONLINE COURSES ============
  {
    title: 'Udemy - Complete Web Development Bootcamp',
    description: 'Full stack web development covering HTML5, CSS3, JavaScript, Node, Express, MongoDB, React',
    link: 'https://www.udemy.com/course/the-complete-web-development-bootcamp',
    category: 'Course',
    tags: ['Web Development', 'Full Stack', 'Bootcamp', 'HTML', 'CSS', 'JavaScript'],
    difficulty: 'Beginner',
    duration: '63 hours',
    upvotes: 890,
    createdBy: 'system',
    author: 'Angela Yu',
    language: 'English',
    source: 'Udemy',
  },
  {
    title: 'Coursera - Meta Front-End Developer Certificate',
    description: 'Professional certificate in front-end development by Meta. Learn React, JavaScript, CSS',
    link: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
    category: 'Course',
    tags: ['Frontend', 'React', 'JavaScript', 'Professional Certificate'],
    difficulty: 'Beginner',
    duration: '7 months',
    upvotes: 1230,
    createdBy: 'system',
    author: 'Meta',
    language: 'English',
    source: 'Coursera',
  },
  {
    title: 'freeCodeCamp - Responsive Web Design',
    description: 'Free certification course on responsive web design, HTML5, CSS3, and web design principles',
    link: 'https://www.freecodecamp.org/learn/responsive-web-design',
    category: 'Course',
    tags: ['Web Design', 'CSS', 'HTML', 'Responsive', 'Free', 'Certification'],
    difficulty: 'Beginner',
    duration: '300 hours',
    upvotes: 756,
    createdBy: 'system',
    author: 'freeCodeCamp',
    language: 'English',
    source: 'freeCodeCamp',
  },
  {
    title: 'Scrimba - Learn React',
    description: 'Interactive React course with live coding challenges and projects',
    link: 'https://scrimba.com/learn/react',
    category: 'Course',
    tags: ['React', 'Interactive', 'Frontend', 'JavaScript'],
    difficulty: 'Intermediate',
    duration: '6 weeks',
    upvotes: 543,
    createdBy: 'system',
    author: 'Scrimba',
    language: 'English',
    source: 'Scrimba',
  },
  {
    title: 'Pluralsight - JavaScript Path',
    description: 'Comprehensive JavaScript learning path from fundamentals to advanced',
    link: 'https://www.pluralsight.com/paths/javascript',
    category: 'Course',
    tags: ['JavaScript', 'Learning Path', 'Frontend', 'Professional'],
    difficulty: 'Beginner',
    duration: '40 hours',
    upvotes: 634,
    createdBy: 'system',
    author: 'Pluralsight',
    language: 'English',
    source: 'Pluralsight',
  },
  {
    title: 'LinkedIn Learning - TypeScript Essential Training',
    description: 'Learn TypeScript from basics to advanced concepts',
    link: 'https://www.linkedin.com/learning/typescript-essential-training',
    category: 'Course',
    tags: ['TypeScript', 'JavaScript', 'Frontend', 'Professional'],
    difficulty: 'Intermediate',
    duration: '6 hours',
    upvotes: 512,
    createdBy: 'system',
    author: 'LinkedIn Learning',
    language: 'English',
    source: 'LinkedIn Learning',
  },
  {
    title: 'edX - Introduction to Web Development',
    description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript',
    link: 'https://www.edx.org/course/introduction-to-web-development',
    category: 'Course',
    tags: ['Web Development', 'Fundamentals', 'HTML', 'CSS', 'JavaScript'],
    difficulty: 'Beginner',
    duration: '8 weeks',
    upvotes: 445,
    createdBy: 'system',
    author: 'edX',
    language: 'English',
    source: 'edX',
  },

  // ============ BLOG POSTS ============
  {
    title: 'CSS Tricks - A Complete Guide to Grid',
    description: 'Comprehensive guide to CSS Grid layout system with examples and best practices',
    link: 'https://css-tricks.com/snippets/css/complete-guide-grid',
    category: 'Blog',
    tags: ['CSS', 'Layout', 'Frontend', 'Grid', 'Tutorial'],
    difficulty: 'Intermediate',
    upvotes: 645,
    createdBy: 'system',
    author: 'Chris House',
    language: 'English',
    source: 'CSS Tricks',
  },
  {
    title: 'Dev.to - React Hooks Explained',
    description: 'In-depth explanation of React Hooks with practical examples and use cases',
    link: 'https://dev.to/devteam/react-hooks-explained',
    category: 'Blog',
    tags: ['React', 'Hooks', 'JavaScript', 'Tutorial'],
    difficulty: 'Intermediate',
    upvotes: 432,
    createdBy: 'system',
    author: 'Dev Community',
    language: 'English',
    source: 'Dev.to',
  },
  {
    title: 'Medium - Building Scalable Applications',
    description: 'Best practices for building scalable and maintainable web applications',
    link: 'https://medium.com/@username/building-scalable-applications',
    category: 'Blog',
    tags: ['Architecture', 'Best Practices', 'Scalability', 'System Design'],
    difficulty: 'Advanced',
    upvotes: 234,
    createdBy: 'system',
    author: 'Medium Authors',
    language: 'English',
    source: 'Medium',
  },
  {
    title: 'Hashnode - 10 JavaScript Performance Tips',
    description: 'Essential tips to improve JavaScript performance and optimization techniques',
    link: 'https://hashnode.com/post/javascript-performance-tips',
    category: 'Blog',
    tags: ['JavaScript', 'Performance', 'Optimization', 'Backend'],
    difficulty: 'Intermediate',
    upvotes: 567,
    createdBy: 'system',
    author: 'Hashnode Community',
    language: 'English',
    source: 'Hashnode',
  },
  {
    title: 'LogRocket - Understanding Async/Await in JavaScript',
    description: 'Complete guide to async/await pattern in modern JavaScript',
    link: 'https://logrocket.com/blog/async-await-javascript',
    category: 'Blog',
    tags: ['JavaScript', 'Async', 'Promises', 'Tutorial'],
    difficulty: 'Intermediate',
    upvotes: 498,
    createdBy: 'system',
    author: 'LogRocket',
    language: 'English',
    source: 'LogRocket',
  },
  {
    title: 'Smashing Magazine - Web Performance Optimization',
    description: 'Techniques for optimizing web performance and improving user experience',
    link: 'https://www.smashingmagazine.com/web-performance',
    category: 'Blog',
    tags: ['Performance', 'Frontend', 'UX', 'Optimization'],
    difficulty: 'Intermediate',
    upvotes: 389,
    createdBy: 'system',
    author: 'Smashing Magazine',
    language: 'English',
    source: 'Smashing Magazine',
  },
  {
    title: 'CSS Tricks - A Complete Guide to Flexbox',
    description: 'Comprehensive guide to CSS Flexbox layout with visual examples',
    link: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox',
    category: 'Blog',
    tags: ['CSS', 'Layout', 'Frontend', 'Flexbox'],
    difficulty: 'Beginner',
    upvotes: 723,
    createdBy: 'system',
    author: 'Chris Coyier',
    language: 'English',
    source: 'CSS Tricks',
  },
  {
    title: 'DEV Community - REST API Best Practices',
    description: 'Best practices for designing and building RESTful APIs',
    link: 'https://dev.to/rest-api-best-practices',
    category: 'Blog',
    tags: ['API', 'Backend', 'REST', 'Best Practices'],
    difficulty: 'Intermediate',
    upvotes: 556,
    createdBy: 'system',
    author: 'DEV Community',
    language: 'English',
    source: 'Dev.to',
  },
];

/**
 * Seed the database with curated resources
 */
export async function seedResources(): Promise<void> {
  try {
    // Check if resources already exist
    const { count } = await supabase
      .from('resources')
      .select('id', { count: 'exact' });

    if (count && count > 0) {
      console.log(`Database already has ${count} resources. Skipping seed.`);
      return;
    }

    // Prepare resources with proper fields
    const resourcesToInsert = curatedResources.map(resource => ({
      ...resource,
      created_by: null, // System resources don't have a creator
    }));

    // Insert in batches to avoid timeout
    const batchSize = 10;
    for (let i = 0; i < resourcesToInsert.length; i += batchSize) {
      const batch = resourcesToInsert.slice(i, i + batchSize);
      const { error } = await supabase
        .from('resources')
        .insert(batch);

      if (error) {
        console.error(`Error seeding batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`✓ Seeded batch ${i / batchSize + 1} (${batch.length} resources)`);
      }
    }

    console.log('✓ Resource seeding complete!');
  } catch (error) {
    console.error('Error during resource seeding:', error);
  }
}

/**
 * Get a random sample of resources by category
 */
export function getResourcesByCategory(category: string): Omit<Resource, 'id' | 'createdAt'>[] {
  return curatedResources.filter(r => r.category === category);
}

/**
 * Get trending resources (popular + recent)
 */
export function getTrendingResources(limit: number = 10): Omit<Resource, 'id' | 'createdAt'>[] {
  return curatedResources
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, limit);
}

/**
 * Search resources by query
 */
export function searchResources(query: string): Omit<Resource, 'id' | 'createdAt'>[] {
  const lowerQuery = query.toLowerCase();
  return curatedResources.filter(
    r =>
      r.title.toLowerCase().includes(lowerQuery) ||
      r.description?.toLowerCase().includes(lowerQuery) ||
      r.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
