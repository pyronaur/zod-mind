export type AnyValue = null | string | number | boolean | AnyArray | AnyObject;
export type AnyArray = AnyValue[];
export type AnyObject = {
	[key: string]: AnyValue;
};
