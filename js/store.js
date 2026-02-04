
const CURRENT_USER = {
  name: 'Eleanor Vance',
  email: 'eleanor.vance@email.com',
  avatarUrl: 'https://picsum.photos/id/64/200/200'
};

const INITIAL_LESSONS = [
  {
    id: '1',
    title: 'How to share a photo',
    description: 'Learn how to share your favorite photos with friends and family.',
    createdAt: 'June 15',
    thumbnailUrl: 'https://picsum.photos/id/1/400/800', 
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    id: '2',
    title: 'How to send a text message',
    description: 'A simple guide to sending SMS messages.',
    createdAt: 'June 12',
    thumbnailUrl: 'https://picsum.photos/id/2/400/800',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    id: '3',
    title: 'Finding directions on Maps',
    description: 'Never get lost again with this maps tutorial.',
    createdAt: 'June 10',
    thumbnailUrl: 'https://picsum.photos/id/3/400/800',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  }
];

// Initialize store
if (!localStorage.getItem('lessons')) {
  localStorage.setItem('lessons', JSON.stringify(INITIAL_LESSONS));
}

export const getLessons = () => {
  try {
    const lessons = localStorage.getItem('lessons');
    if (!lessons) return [];
    const parsed = JSON.parse(lessons);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error parsing lessons from localStorage:', e);
    return [];
  }
};

export const addLesson = (lesson) => {
  const lessons = getLessons();
  lessons.unshift(lesson);
  localStorage.setItem('lessons', JSON.stringify(lessons));
};

export const getLessonById = (id) => {
  const lessons = getLessons();
  return lessons.find(l => l.id === id);
};

export const getCurrentUser = () => {
  return CURRENT_USER;
};
