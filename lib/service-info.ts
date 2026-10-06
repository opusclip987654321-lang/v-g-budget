export type ServiceInfo={publisher:string;address:string;registration:string;contactEmail:string;terms:string;privacy:string};
export const emptyServiceInfo:ServiceInfo={publisher:'',address:'',registration:'',contactEmail:'',terms:'',privacy:''};
export function serviceComplete(s:ServiceInfo){return !!(s.publisher&&s.address&&s.registration&&s.contactEmail&&s.terms&&s.privacy);}
