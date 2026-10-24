export const vocabulary = [
  {id:'help', text:'I need help'}, {id:'doctor',text:'I need a doctor'}, {id:'pain',text:'I am in pain'},
  {id:'water',text:'I need water'}, {id:'toilet',text:'Where is the toilet?'},
  {id:'yes',text:'Yes'}, {id:'no',text:'No'}, {id:'thank_you',text:'Thank you'},
  {id:'wait',text:'Please wait'}, {id:'emergency',text:'I need urgent help'}
];
export const classIds=['idle',...vocabulary.map(x=>x.id)];
