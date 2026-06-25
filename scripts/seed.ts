import mammoth from 'mammoth'
import { db } from '@/lib/db'
import {
  schools,
  departments,
  degreePrograms,
  careerPaths,
} from '@/lib/db/schema'
import { v4 as uuidv4 } from 'uuid'

async function seedDatabase() {
  try {
    console.log('Starting database seed...')

    // Parse the academic programs catalog
    const catalogResult = await mammoth.extractRawText({
      path: 'data/LMUI_Academic_Programs_Catalog-3ac92e.docx',
    })
    const catalogText = catalogResult.value

    // Parse the career guidance framework
    const careerResult = await mammoth.extractRawText({
      path: 'data/LMUI_Career_Guidance_Framework-888f64.docx',
    })
    const careerText = careerResult.value

    // Initialize with the 4 schools mentioned in documents
    const schoolsData = [
      {
        id: uuidv4(),
        name: 'School of Engineering',
        description:
          'Offers engineering programs across various specializations',
      },
      {
        id: uuidv4(),
        name: 'School of Business',
        description: 'Provides business and management education',
      },
      {
        id: uuidv4(),
        name: 'School of Medicine',
        description: 'Medical and health sciences programs',
      },
      {
        id: uuidv4(),
        name: 'School of Agriculture',
        description: 'Agricultural science and related programs',
      },
    ]

    // Insert schools
    await db.insert(schools).values(
      schoolsData.map(({ id, name, description }) => ({
        id,
        name,
        description,
      }))
    )
    console.log('Schools inserted:', schoolsData.length)

    // Create base departments for each school
    const departmentsData = [
      // Engineering departments
      {
        id: uuidv4(),
        schoolId: schoolsData[0].id,
        name: 'Civil Engineering',
        description: 'Civil engineering specialization',
      },
      {
        id: uuidv4(),
        schoolId: schoolsData[0].id,
        name: 'Electrical Engineering',
        description: 'Electrical engineering specialization',
      },
      {
        id: uuidv4(),
        schoolId: schoolsData[0].id,
        name: 'Mechanical Engineering',
        description: 'Mechanical engineering specialization',
      },
      // Business departments
      {
        id: uuidv4(),
        schoolId: schoolsData[1].id,
        name: 'Accounting',
        description: 'Accounting and finance programs',
      },
      {
        id: uuidv4(),
        schoolId: schoolsData[1].id,
        name: 'Management',
        description: 'Business management programs',
      },
      // Medicine departments
      {
        id: uuidv4(),
        schoolId: schoolsData[2].id,
        name: 'General Medicine',
        description: 'General medical studies',
      },
      {
        id: uuidv4(),
        schoolId: schoolsData[2].id,
        name: 'Nursing',
        description: 'Nursing programs',
      },
      // Agriculture departments
      {
        id: uuidv4(),
        schoolId: schoolsData[3].id,
        name: 'Agronomy',
        description: 'Crop and soil management',
      },
    ]

    await db.insert(departments).values(
      departmentsData.map(({ id, schoolId, name, description }) => ({
        id,
        schoolid: schoolId,
        name,
        description,
      }))
    )
    console.log('Departments inserted:', departmentsData.length)

    // Create degree programs with levels
    const programsData = [
      {
        id: uuidv4(),
        departmentId: departmentsData[0].id,
        name: 'Civil Engineering',
        level: 'BSc',
        description: 'Bachelor of Science in Civil Engineering',
        duration: '4 years',
      },
      {
        id: uuidv4(),
        departmentId: departmentsData[1].id,
        name: 'Electrical Engineering',
        level: 'BTech',
        description: 'Bachelor of Technology in Electrical Engineering',
        duration: '4 years',
      },
      {
        id: uuidv4(),
        departmentId: departmentsData[2].id,
        name: 'Mechanical Engineering',
        level: 'BSc',
        description: 'Bachelor of Science in Mechanical Engineering',
        duration: '4 years',
      },
      {
        id: uuidv4(),
        departmentId: departmentsData[3].id,
        name: 'Accounting',
        level: 'BBA',
        description: 'Bachelor of Business Administration in Accounting',
        duration: '4 years',
      },
      {
        id: uuidv4(),
        departmentId: departmentsData[4].id,
        name: 'Business Administration',
        level: 'BBA',
        description: 'Bachelor of Business Administration',
        duration: '4 years',
      },
      {
        id: uuidv4(),
        departmentId: departmentsData[4].id,
        name: 'Business Administration',
        level: 'MBA',
        description: 'Master of Business Administration',
        duration: '2 years',
      },
      {
        id: uuidv4(),
        departmentId: departmentsData[5].id,
        name: 'Medicine',
        level: 'MD',
        description: 'Doctor of Medicine',
        duration: '5-6 years',
      },
      {
        id: uuidv4(),
        departmentId: departmentsData[6].id,
        name: 'Nursing',
        level: 'BSc',
        description: 'Bachelor of Science in Nursing',
        duration: '4 years',
      },
      {
        id: uuidv4(),
        departmentId: departmentsData[7].id,
        name: 'Agronomy',
        level: 'BSc',
        description: 'Bachelor of Science in Agronomy',
        duration: '4 years',
      },
    ]

    await db.insert(degreePrograms).values(
      programsData.map(({ id, departmentId, name, level, description, duration }) => ({
        id,
        departmentid: departmentId,
        name,
        level,
        description,
        duration,
      }))
    )
    console.log('Degree programs inserted:', programsData.length)

    // Create career paths
    const careerPathsData = [
      {
        id: uuidv4(),
        title: 'Software Engineer',
        description:
          'Design and develop software solutions, specializing in various technologies and frameworks',
        relatedPrograms: 'Computer Science, Software Engineering, Engineering',
        salaryRange: '$80,000 - $150,000',
        jobMarketDemand: 'High',
      },
      {
        id: uuidv4(),
        title: 'Business Analyst',
        description:
          'Analyze business processes, identify improvements, and implement solutions',
        relatedPrograms: 'Business Administration, Management, Accounting',
        salaryRange: '$60,000 - $120,000',
        jobMarketDemand: 'High',
      },
      {
        id: uuidv4(),
        title: 'Healthcare Professional',
        description:
          'Provide medical care, nursing services, or health support to patients',
        relatedPrograms: 'Medicine, Nursing, Health Sciences',
        salaryRange: '$50,000 - $130,000',
        jobMarketDemand: 'Very High',
      },
      {
        id: uuidv4(),
        title: 'Civil Engineer',
        description:
          'Design, plan, and oversee construction of infrastructure projects',
        relatedPrograms: 'Civil Engineering, Infrastructure, Construction',
        salaryRange: '$70,000 - $140,000',
        jobMarketDemand: 'Medium-High',
      },
      {
        id: uuidv4(),
        title: 'Accountant/Financial Analyst',
        description:
          'Manage financial records, analyze financial performance, and provide insights',
        relatedPrograms: 'Accounting, Finance, Business Administration',
        salaryRange: '$55,000 - $110,000',
        jobMarketDemand: 'High',
      },
      {
        id: uuidv4(),
        title: 'Agricultural Specialist',
        description:
          'Optimize crop production, manage soil health, and improve farming practices',
        relatedPrograms: 'Agronomy, Agriculture, Environmental Science',
        salaryRange: '$45,000 - $95,000',
        jobMarketDemand: 'Medium',
      },
    ]

    await db.insert(careerPaths).values(
      careerPathsData.map(
        ({ id, title, description, relatedPrograms, salaryRange, jobMarketDemand }) => ({
          id,
          title,
          description,
          relatedprograms: relatedPrograms,
          salaryrange: salaryRange,
          jobmarketdemand: jobMarketDemand,
        })
      )
    )
    console.log('Career paths inserted:', careerPathsData.length)

    console.log('Database seed completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

seedDatabase()
