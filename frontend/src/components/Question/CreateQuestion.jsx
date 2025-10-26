import React from 'react';
import CreateQuestionPage from "./CreateQuestionPage"; 

const CreateQuestion = () => {
  // Simulated label data (to be retrieved later from the Flask API)
  const mockTags = [
    {
      id: '1',
      name: 'JavaScript',
      description: 'JavaScript programming language',
      totalQuestions: 1250,
      askedToday: 15,
      askedThisWeek: 89,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Python',
      description: 'Python programming language',
      totalQuestions: 890,
      askedToday: 12,
      askedThisWeek: 67,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '3',
      name: 'React',
      description: 'React library for building user interfaces',
      totalQuestions: 756,
      askedToday: 8,
      askedThisWeek: 54,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '4',
      name: 'Flask',
      description: 'Flask web framework for Python',
      totalQuestions: 450,
      askedToday: 5,
      askedThisWeek: 32,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '5',
      name: 'Database',
      description: 'Database design and SQL queries',
      totalQuestions: 890,
      askedToday: 10,
      askedThisWeek: 65,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '6',
      name: 'Algorithms',
      description: 'Algorithm design and analysis',
      totalQuestions: 620,
      askedToday: 7,
      askedThisWeek: 45,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '7',
      name: 'Git',
      description: 'Version control with Git',
      totalQuestions: 340,
      askedToday: 4,
      askedThisWeek: 28,
      isNew: true,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '8',
      name: 'API',
      description: 'RESTful API design',
      totalQuestions: 280,
      askedToday: 3,
      askedThisWeek: 18,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '9',
      name: 'Debugging',
      description: 'Debugging techniques and tools',
      totalQuestions: 190,
      askedToday: 2,
      askedThisWeek: 12,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '10',
      name: 'HTML',
      description: 'HTML markup language',
      totalQuestions: 560,
      askedToday: 6,
      askedThisWeek: 38,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '11',
      name: 'Excel',
      description: 'Microsoft Excel spreadsheet application',
      totalQuestions: 1580,
      askedToday: 22,
      askedThisWeek: 145,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '12',
      name: 'Array-Formula',
      description: 'Excel and Google Sheets array formulas',
      totalQuestions: 234,
      askedToday: 3,
      askedThisWeek: 18,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '13',
      name: 'COUNTIF',
      description: 'Excel COUNTIF function for conditional counting',
      totalQuestions: 156,
      askedToday: 2,
      askedThisWeek: 12,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '14',
      name: 'Formulas',
      description: 'Spreadsheet formulas and functions',
      totalQuestions: 892,
      askedToday: 11,
      askedThisWeek: 76,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '15',
      name: 'Spreadsheet',
      description: 'General spreadsheet applications (Excel, Google Sheets, etc.)',
      totalQuestions: 678,
      askedToday: 8,
      askedThisWeek: 52,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '16',
      name: 'Google-Sheets',
      description: 'Google Sheets online spreadsheet application',
      totalQuestions: 423,
      askedToday: 5,
      askedThisWeek: 34,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '17',
      name: 'VBA',
      description: 'Visual Basic for Applications (Excel macros)',
      totalQuestions: 512,
      askedToday: 6,
      askedThisWeek: 41,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '18',
      name: 'Data-Analysis',
      description: 'Data analysis techniques and tools',
      totalQuestions: 734,
      askedToday: 9,
      askedThisWeek: 63,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '19',
      name: 'CSS',
      description: 'Cascading Style Sheets for styling web pages',
      totalQuestions: 845,
      askedToday: 10,
      askedThisWeek: 71,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '20',
      name: 'Node.js',
      description: 'JavaScript runtime built on Chrome V8 engine',
      totalQuestions: 678,
      askedToday: 8,
      askedThisWeek: 55,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '21',
      name: 'SQL',
      description: 'Structured Query Language for databases',
      totalQuestions: 923,
      askedToday: 12,
      askedThisWeek: 78,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '22',
      name: 'MongoDB',
      description: 'NoSQL document-oriented database',
      totalQuestions: 456,
      askedToday: 5,
      askedThisWeek: 39,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '23',
      name: 'TypeScript',
      description: 'Typed superset of JavaScript',
      totalQuestions: 534,
      askedToday: 6,
      askedThisWeek: 44,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '24',
      name: 'Django',
      description: 'High-level Python web framework',
      totalQuestions: 412,
      askedToday: 5,
      askedThisWeek: 33,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '25',
      name: 'Docker',
      description: 'Platform for containerizing applications',
      totalQuestions: 389,
      askedToday: 4,
      askedThisWeek: 31,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '26',
      name: 'Linux',
      description: 'Linux operating system and commands',
      totalQuestions: 567,
      askedToday: 7,
      askedThisWeek: 46,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '27',
      name: 'Machine-Learning',
      description: 'Machine learning algorithms and techniques',
      totalQuestions: 645,
      askedToday: 8,
      askedThisWeek: 53,
      isNew: true,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '28',
      name: 'Testing',
      description: 'Software testing and quality assurance',
      totalQuestions: 378,
      askedToday: 4,
      askedThisWeek: 29,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '29',
      name: 'AWS',
      description: 'Amazon Web Services cloud platform',
      totalQuestions: 491,
      askedToday: 6,
      askedThisWeek: 38,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
    {
      id: '30',
      name: 'Vue',
      description: 'Progressive JavaScript framework',
      totalQuestions: 367,
      askedToday: 4,
      askedThisWeek: 27,
      isNew: false,
      isPersonal: false,
      createdAt: new Date(),
    },
  ];

  const handleSubmit = async (questionData) => {
    try {
      const response = await fetch('http://localhost:5000/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Question created successfully!');
        window.location.href = `/questions/${data.id}`;
      } else {
        throw new Error('Failed to create question');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleSearchSimilar = async (title) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/questions/similar?title=${encodeURIComponent(title)}`
      );
      const data = await response.json();
      return data.similar_questions || [];
    } catch (error) {
      console.error('Error searching similar questions:', error);
      return [];
    }
  };

  const handleCreateTag = async (tagName) => {
    try {
      const response = await fetch('http://localhost:5000/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  };

  return (
    <CreateQuestionPage
      availableTags={mockTags}
      userPersonalTags={[]}
      onSubmit={handleSubmit}
      onSearchSimilar={handleSearchSimilar}
      onCreateTag={handleCreateTag}
      currentUserId="user123"
    />
  );
};

export default CreateQuestion;