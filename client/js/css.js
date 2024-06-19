export function parse(styleSheet) {
    const rules = [...styleSheet.rules].map(rule => {
	const ruleText = rule.cssText;
	const spaceIdx = ruleText.indexOf('{');
	const selector = ruleText.slice(0, spaceIdx).trim();
	const propertiesText = ruleText.slice(spaceIdx);
	const propertiesLines = propertiesText
	      .replace('{', '')
	      .replace('}', '')
	      .split(';');

	const propertiesPairs = propertiesLines.map(line => {
	    const [key, value] = line.split(':').map(s => s.trim());
	    return {key, value};
	}).filter(({key, value}) => value !== undefined);
	const properties = propertiesPairs.reduce((acc, current) => {
	    acc[current.key] = current.value;
	    return acc;
	}, {});
	return {selector, properties};
    });
    const rulesObj = rules.reduce((acc, current) => {
	acc[current.selector] = current.properties;
	return acc;
    }, {});    
    return rulesObj;
}
