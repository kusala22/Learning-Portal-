const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Video = require('../models/Video');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Video.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'GVCC Admin',
      email: 'admin@gvcc.edu',
      password: 'admin123',
      role: 'admin',
    });

    // Create sample students
    const students = await User.create([
      { name: 'Alice Johnson', email: 'alice@student.com', password: 'student123' },
      { name: 'Bob Smith', email: 'bob@student.com', password: 'student123' },
      { name: 'Carol Davis', email: 'carol@student.com', password: 'student123' },
    ]);

    // Create sample videos
    const videos = await Video.create([
      {
        title: 'Introduction to JavaScript',
        description: 'Learn the fundamentals of JavaScript programming language. This comprehensive course covers variables, data types, functions, and control flow.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=640&h=360&fit=crop',
        duration: 596,
        durationFormatted: '09:56',
        category: 'JavaScript',
        tags: ['javascript', 'programming', 'beginner'],
        instructor: 'Prof. John Doe',
        uploadedBy: admin._id,
      },
      {
        title: 'React.js Fundamentals',
        description: 'Master React.js from scratch. Learn components, state management, hooks, and build modern web applications.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&h=360&fit=crop',
        duration: 653,
        durationFormatted: '10:53',
        category: 'React',
        tags: ['react', 'javascript', 'frontend'],
        instructor: 'Prof. Jane Smith',
        uploadedBy: admin._id,
      },
      {
        title: 'Node.js & Express Backend',
        description: 'Build powerful backend APIs with Node.js and Express. Learn REST API design, middleware, and database integration.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=640&h=360&fit=crop',
        duration: 215,
        durationFormatted: '03:35',
        category: 'Node.js',
        tags: ['nodejs', 'express', 'backend', 'api'],
        instructor: 'Prof. Mike Johnson',
        uploadedBy: admin._id,
      },
      {
        title: 'MongoDB Database Design',
        description: 'Learn MongoDB from the ground up. Schema design, queries, aggregation pipeline, and best practices.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=640&h=360&fit=crop',
        duration: 120,
        durationFormatted: '02:00',
        category: 'Database',
        tags: ['mongodb', 'database', 'nosql'],
        instructor: 'Prof. Sarah Williams',
        uploadedBy: admin._id,
      },
      {
        title: 'CSS & Tailwind CSS Mastery',
        description: 'Master modern CSS techniques and Tailwind CSS utility framework to create stunning, responsive designs.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=640&h=360&fit=crop',
        duration: 600,
        durationFormatted: '10:00',
        category: 'CSS',
        tags: ['css', 'tailwind', 'design', 'frontend'],
        instructor: 'Prof. Emily Chen',
        uploadedBy: admin._id,
      },
      {
        title: 'Data Structures & Algorithms',
        description: 'Deep dive into fundamental data structures and algorithms. Essential knowledge for technical interviews.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=640&h=360&fit=crop',
        duration: 218,
        durationFormatted: '03:38',
        category: 'Computer Science',
        tags: ['algorithms', 'data structures', 'cs'],
        instructor: 'Prof. Alex Turner',
        uploadedBy: admin._id,
      },
      {
        title: 'Python for Data Science',
        description: 'Learn Python programming with a focus on data science. NumPy, Pandas, Matplotlib, and machine learning basics.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=640&h=360&fit=crop',
        duration: 120,
        durationFormatted: '02:00',
        category: 'Python',
        tags: ['python', 'data science', 'machine learning'],
        instructor: 'Prof. Lisa Park',
        uploadedBy: admin._id,
      },
      {
        title: 'Docker & Kubernetes',
        description: 'Containerize applications with Docker and orchestrate with Kubernetes. DevOps essentials for modern developers.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=640&h=360&fit=crop',
        duration: 888,
        durationFormatted: '14:48',
        category: 'DevOps',
        tags: ['docker', 'kubernetes', 'devops', 'containers'],
        instructor: 'Prof. Ryan Adams',
        uploadedBy: admin._id,
      },
    ]);

    console.log(`✅ Created ${students.length + 1} users (1 admin + ${students.length} students)`);
    console.log(`✅ Created ${videos.length} sample videos`);
    console.log('\n📋 Login credentials:');
    console.log('Admin: admin@gvcc.edu / admin123');
    console.log('Student: alice@student.com / student123');
    console.log('\n🎉 Database seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
