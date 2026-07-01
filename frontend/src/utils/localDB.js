const SEED_CONTACTS = [
  {
    _id: "seed_1",
    name: "Jane Austen",
    company: "Austen Books",
    email: "jane@austen.com",
    phone: "+44 (175) 123-4567",
    status: "Interested",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    _id: "seed_2",
    name: "Alan Turing",
    company: "Bletchley Park",
    email: "alan@turing.org",
    phone: "+44 (191) 290-0945",
    status: "Follow-up",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
  {
    _id: "seed_3",
    name: "Marie Curie",
    company: "Radium Institute",
    email: "marie@curie.fr",
    phone: "+33 (140) 293-1829",
    status: "Closed",
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
  }
];

export const getLocalContacts = () => {
  const data = localStorage.getItem("conex_contacts");
  if (!data) {
    localStorage.setItem("conex_contacts", JSON.stringify(SEED_CONTACTS));
    return SEED_CONTACTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    localStorage.setItem("conex_contacts", JSON.stringify(SEED_CONTACTS));
    return SEED_CONTACTS;
  }
};

export const saveLocalContacts = (contacts) => {
  localStorage.setItem("conex_contacts", JSON.stringify(contacts));
};
