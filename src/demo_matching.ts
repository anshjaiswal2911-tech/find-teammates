import { computeCompatibility, generateMatches, simulateMutualLike } from './app/lib/matchingAlgorithm';
import { User } from './app/lib/types';

// Mock Users
const currentUser: User = {
    id: 'u1',
    name: 'Alice Developer',
    email: 'alice@example.com',
    college: 'Tech University',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    interests: ['AI', 'Open Source', 'UI/UX'],
    experience: 'Intermediate',
    bio: 'Full-stack dev looking for a partner for a hackathon.',
    availability: 'Part-time'
};

const otherUsers: User[] = [
    {
        id: 'u2',
        name: 'Bob Backend',
        email: 'bob@example.com',
        college: 'Data College',
        skills: ['Python', 'Node.js', 'PostgreSQL', 'Redis'],
        interests: ['AI', 'Scalability'],
        experience: 'Intermediate',
        bio: 'Backend wizard interested in AI projects.',
        availability: 'Part-time'
    },
    {
        id: 'u3',
        name: 'Charlie Creative',
        email: 'charlie@example.com',
        college: 'Arts Institute',
        skills: ['Figma', 'React', 'Tailwind CSS'],
        interests: ['UI/UX', 'Design Systems'],
        experience: 'Advanced',
        bio: 'Product designer and frontend enthusiast.',
        availability: 'Full-time'
    },
    {
        id: 'u4',
        name: 'Dave Newbie',
        email: 'dave@example.com',
        college: 'State University',
        skills: ['Python', 'HTML'],
        interests: ['Learning', 'Web Development'],
        experience: 'Beginner',
        bio: 'Just starting out, looking for mentors.',
        availability: 'Part-time'
    }
];

console.log('--- COLLABNEST MATCHING ALGORITHM DEMO ---\n');

console.log(`Current User: ${currentUser.name} (${currentUser.skills.join(', ')})\n`);

console.log('--- COMPATIBILITY SCORES ---');
otherUsers.forEach(user => {
    const score = computeCompatibility(currentUser, user);
    console.log(`${user.name}: ${score}%`);
});
console.log('');

console.log('--- GENERATING MATCH QUEUE ---');
const matches = generateMatches(currentUser, otherUsers);
matches.forEach((match, index) => {
    console.log(`${index + 1}. ${match.user.name} - Score: ${match.compatibilityScore}%`);
    console.log(`   Explanation: ${match.explanation}`);
    console.log(`   Shared Skills: ${match.skillOverlap.join(', ') || 'None'}`);
    console.log(`   Complementary Skills: ${match.complementarySkills.join(', ') || 'None'}`);
    console.log('');
});

console.log('--- MUTUAL LIKE SIMULATION ---');
matches.forEach(match => {
    const isMatch = simulateMutualLike(match.compatibilityScore);
    console.log(`Swipe Right on ${match.user.name}: ${isMatch ? 'IT\'S A MATCH! 🎉' : 'No match yet (keep swiping)'}`);
});
