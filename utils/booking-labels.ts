const subjectsList = new Intl.ListFormat("en-AU", { type: "conjunction" });
const campusesList = new Intl.ListFormat("en-AU", { type: "disjunction" });

export const formatSubjects = (subjects: string[]): string => subjectsList.format(subjects) || "Consultation";
export const formatCampuses = (campuses: string[]): string => campusesList.format(campuses) || "Campus unspecified";
