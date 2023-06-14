class DocumentNotFound extends Error {
	constructor(resource: string, id: string) {
		super(`${id} not found in ${resource} collection`);
	}
}

export default DocumentNotFound;
