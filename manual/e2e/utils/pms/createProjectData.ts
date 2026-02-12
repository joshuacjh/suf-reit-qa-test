import { faker } from "@faker-js/faker";

export function generateCompanyProfileData(){
  const hasSST = faker.datatype.boolean();
  const suffixes = ['Sdn Bhd', 'Company'];
  const middleWordCounts = faker.number.int({min: 1, max: 2});
  const companyName = `Sunway ${faker.word.words(middleWordCounts)} ${faker.helpers.arrayElement(suffixes)}`

  return {
    companyName: companyName,
    companyCode: faker.string.alpha(3).toUpperCase(),
    
    //dropdown
    jdeEnvironment: "",

    jdeIndustryType: faker.helpers.arrayElement(["Manufacturing", "Distribution and Logistics", "Consumer Packaged Goods", "Engineering", "Operations", "Retails", "Financial Services"]),
    jdeCompanyCode: faker.string.numeric(5),
    jdeBusinessCode: faker.string.numeric(5),
    registrationIDNo: faker.string.numeric({length: 12, allowLeadingZeros: false}),
    gstRegistrationNo: faker.string.numeric({length: 12, allowLeadingZeros: false}),
    sstEnabled: hasSST ? "Yes" : "No",
    sstRegistrationNO: hasSST ? faker.string.numeric(12) : "",
    clientId: faker.string.alphanumeric(6),
    secretKey1: faker.string.alphanumeric(8),
    secretKey2: faker.string.alphanumeric(8),
    tinNumber: faker.string.numeric(16),
    address: faker.location.streetAddress(),

    //dropdown
    country: "Malaysia",
    state: "" as string,
    city: "" as string,
    district: "" as string,

    postcode: faker.location.zipCode("#####"),
    phoneNo: '18' + faker.string.numeric(7),
    emailAddr: companyName
      .toLowerCase()
      .replace(/sdn bhd|company/g, '')    // remove the suffix
      .replace(/[^a-z0-9]+/g, '.')    // replace the space & symbols with dots
      .replace(/^\.+|\.+$/g, '')  // trim dots
      + '@gmail.com'
  };
}

function formatDate(date: Date){
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear();
  return `${day}/${month}/${year}`
}

export function generateProjectData(){
  const startDate = faker.date.past({ years: 1 });
  const endDate = faker.date.future({ years: 1 });

  return {
    // dropdown
    region: '',

    location: faker.location.city(),
    projectName: faker.company.name(),
    projectCode: faker.string.alpha({length: {min: 2, max: 5}}).toUpperCase(),

    // project start date and end date
    projectStartDate: formatDate(startDate),
    projectEndDate: formatDate(endDate)
  }
}

export function generatePhaseData(){
  return {
    phaseName: faker.commerce.productName(),
    phaseCode: faker.string.alpha(3).toUpperCase(),
    productType: '',
    phaseTitle: '',
    gstTaxCode: ''
  }
}