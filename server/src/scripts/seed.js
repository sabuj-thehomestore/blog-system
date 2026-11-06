import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { generateSlug } from '../utils/slugify.js';
import { ROLES, AUTH_PROVIDERS, ACTIVITY_ACTIONS } from '../constants/index.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogsystem';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);

    console.log('Seeding users...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@blog.com',
      password: 'AdminPass123!',
      role: ROLES.ADMIN,
      provider: AUTH_PROVIDERS.LOCAL,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });

    const userJohn = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      role: ROLES.USER,
      provider: AUTH_PROVIDERS.LOCAL,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    });

    const userJane = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'Password123!',
      role: ROLES.USER,
      provider: AUTH_PROVIDERS.LOCAL,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    });

    console.log('Seeding blog posts...');
    const postsData = [
      {
        title: 'Mastering the MERN Stack in 2026',
        content: `The MERN stack continues to dominate modern web development. By leveraging MongoDB's flexible document model, Express.js's minimalist routing, React 18's concurrent rendering, and Node.js's event-driven concurrency, developers can build scalable full-stack applications with ease.\n\nIn this article, we dive deep into architectural patterns like Controller-Service-Repository, token refresh rotation, and real-time updates using WebSockets.`,
        excerpt: 'A comprehensive deep dive into building production-grade full stack applications using the MERN stack with modern patterns.',
        author: adminUser._id,
        tags: ['MERN', 'Node.js', 'React', 'MongoDB'],
        coverImage: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=800'
      },
      {
        title: 'Clean Architecture with Controller-Service-Repository Pattern',
        content: `Structuring backend applications for long-term maintainability is critical. The Controller-Service-Repository pattern enforces strict separation of concerns:\n\n1. **Controllers** manage the HTTP boundary.\n2. **Services** contain core business logic and authorization.\n3. **Repositories** isolate database queries and provide a clean abstraction.\n\nThis separation makes unit testing effortless and keeps your codebase modular as complexity scales.`,
        excerpt: 'Learn how to decouple database queries and business logic using the Controller-Service-Repository pattern.',
        author: userJohn._id,
        tags: ['Architecture', 'CleanCode', 'Backend'],
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'
      },
      {
        title: 'Bulletproof Authentication: JWT Access Tokens and Refresh Tokens',
        content: `Securing web applications requires defense in depth. Storing access tokens in memory and rotating refresh tokens in HTTP-only cookies protects users from cross-site scripting (XSS) and replay attacks.\n\nCombine this with rate limiting on login endpoints and bcrypt password hashing, and your authentication system is battle-tested.`,
        excerpt: 'Best practices for securing authentication endpoints with JWT token rotation, bcrypt, and rate limiting.',
        author: userJane._id,
        tags: ['Security', 'JWT', 'Authentication'],
        coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800'
      },
      {
        title: 'Soft Deletes in MongoDB: Why and How',
        content: `Accidental data loss can be catastrophic. Instead of executing hard delete operations immediately, soft deletes mark records with an 'isDeleted' flag and a 'deletedAt' timestamp.\n\nThis preserves data integrity for audit logs, enables undo/restore actions in the admin panel, and keeps historical analytics intact.`,
        excerpt: 'Why soft deletes are essential for production systems and how to implement them effectively with Mongoose.',
        author: userJohn._id,
        tags: ['MongoDB', 'Database', 'BestPractices'],
        coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800'
      }
    ];

    const createdPosts = [];
    for (const p of postsData) {
      const slug = generateSlug(p.title);
      const post = await Post.create({ ...p, slug });
      createdPosts.push(post);
    }

    console.log('Seeding comments...');
    await Comment.create([
      {
        post: createdPosts[0]._id,
        author: userJohn._id,
        content: 'Fantastic article! Clean architecture really changed the way our team builds Node.js backends.'
      },
      {
        post: createdPosts[0]._id,
        author: userJane._id,
        content: 'The section on JWT refresh rotation was particularly insightful. Thanks for writing this!'
      },
      {
        post: createdPosts[1]._id,
        author: adminUser._id,
        content: 'Great write-up John! Excellent breakdown of the repository pattern.'
      }
    ]);

    console.log('Seeding activity logs...');
    await ActivityLog.create([
      {
        user: adminUser._id,
        action: ACTIVITY_ACTIONS.LOGIN,
        resourceType: 'AUTH',
        ipAddress: '127.0.0.1',
        userAgent: 'Seed-Script',
        details: { note: 'Initial admin setup' }
      },
      {
        user: userJohn._id,
        action: ACTIVITY_ACTIONS.POST_CREATE,
        resourceType: 'POST',
        resourceId: createdPosts[1]._id,
        ipAddress: '127.0.0.1',
        userAgent: 'Seed-Script'
      }
    ]);

    console.log('✅ Database successfully seeded!');
    console.log('--------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('  Admin User:   admin@blog.com    / AdminPass123!');
    console.log('  Regular User: john@example.com  / Password123!');
    console.log('  Regular User: jane@example.com  / Password123!');
    console.log('--------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
