export const getProjectTypeColor = (projectType: string) => {
  switch (projectType) {
    case 'construction':
      return 'bg-yellow-100 text-yellow-800';
    case 'software':
      return 'bg-blue-100 text-blue-800';
    case 'consulting':
      return 'bg-green-100 text-green-800';
    case 'manufacturing':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
