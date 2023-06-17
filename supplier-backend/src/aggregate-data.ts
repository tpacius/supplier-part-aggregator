import myarrow from './data/myarrow.json';
import tti from './data/tti.json';

//Function to handle partial aggreagate of Arrow's data
function handleArrow(): AggregatedPart {
  const ap: AggregatedPart = {
    name: '',
    description: '',
    totalStock: 0,
    manufacturerLeadTime: Math.min(),
    manufacturerName: '',
    packaging: [],
    productDoc: '',
    productUrl: '',
    productImageUrl: '',
    specifications: [],
    sourceParts: ['Arrow'],
  };

  const packages: Packaging[] = [];

  //Build packaging list
  for (const response of myarrow.pricingResponse) {
    ap.name = response.partNumber;
    ap.description = response.description;

    if (response.leadTime?.supplierLeadTime < ap.manufacturerLeadTime) {
      ap.manufacturerLeadTime = response.leadTime?.supplierLeadTime;
    }

    for (const data of response.urlData) {
      if (data.type == 'Image Large') {
        ap.productImageUrl = data.value;
      }
      if (data.type == 'Datasheet') {
        ap.productDoc = data.value;
      }
      if (data.type == 'Part Details') {
        ap.productUrl = data.value;
      }
    }

    ap.totalStock = Math.max(ap.totalStock, parseInt(response.fohQuantity));

    const packaging: Packaging = {
      type: 'Unspecified',
      minimumOrderQuantity: response.minOrderQuantity,
      quantityAvailable: parseInt(response.fohQuantity),
      unitPrice: response.resalePrice ? parseInt(response.resalePrice) : 0,
      supplier: 'Arrow',
      priceBreaks: [],
      manufacturerLeadTime: response.leadTime?.arrowLeadTime.toString(),
    };

    //Build price breaks
    const priceBreaks: PriceBreak[] = [];
    response.pricingTier?.forEach((tier) => {
      const breakQuantity = parseInt(tier.minQuantity) ?? 0;
      const unitPrice = parseFloat(tier.resalePrice) ?? 0;
      const priceBreak: PriceBreak = {
        breakQuantity,
        unitPrice,
        totalPrice: breakQuantity * unitPrice,
      };
      priceBreaks.push(priceBreak);
    });

    packaging.priceBreaks = priceBreaks;
    ap.packaging.push(packaging)
  }

  const response = myarrow.pricingResponse[0];

  //Add some specification details, should be the same for this endpoint
  //Adding here to ensure we don't get dupliate values
  ap.specifications.push(
    {
      exportControlClassificationNumberUS:
        response.exportControlClassificationNumberUS,
    },
    {
      exportControlClassificationNumberWAS:
        response.exportControlClassificationNumberWAS,
    },
    { taxnomy: response.taxonomy },
  );
  return ap;
}

//Function to handle partial aggregation of TTI json
function handleTTI(): AggregatedPart {
  const ap: AggregatedPart = {
    name: '',
    description: '',
    totalStock: 0,
    manufacturerLeadTime: Math.min(),
    manufacturerName: '',
    packaging: [],
    productDoc: '',
    productUrl: '',
    productImageUrl: '',
    specifications: [],
    sourceParts: ['TTI'],
  };

  //Build packaging list
  const packages: Packaging[] = [];
  for (const part of tti.parts) {
    ap.manufacturerName = part.manufacturer;

    const packaging: Packaging = {
      type: part.packaging,
      minimumOrderQuantity: part.salesMinimum,
      quantityAvailable: part.availableToSell,
      unitPrice: parseFloat(part.pricing.vipPrice),
      supplier: 'TTI',
      priceBreaks: [],
    };

    //Account for non standard lead time
    if (part.leadTime.includes('Weeks')) {
      const weeks = part.leadTime.split('Weeks')[0];
      const numberOfDays = parseInt(weeks.trim()) * 7;

      //Check if there's a faster lead time than the previous one scene
      //If so use that package's name for the rest of the more variable fields
      if (numberOfDays < ap.manufacturerLeadTime) {
        ap.manufacturerLeadTime = numberOfDays;
        ap.name = part.ttiPartNumber;
        ap.description = part.description;
        ap.productDoc = part.datasheetURL;
        ap.productImageUrl = part.imageURL;
        ap.productUrl = part.buyUrl;
      }
      packaging.manufacturerLeadTime = numberOfDays.toString();
    }
    ap.totalStock = Math.max(ap.totalStock, part.availableToSell);

    const priceBreaks: PriceBreak[] = [];

    for (const quantityPriceBreak of part.pricing.quantityPriceBreaks) {
      const unitPrice = parseFloat(quantityPriceBreak.price);
      const priceBreak: PriceBreak = {
        breakQuantity: quantityPriceBreak.quantity,
        unitPrice,
        totalPrice: unitPrice * quantityPriceBreak.quantity,
      };
      priceBreaks.push(priceBreak);
    }

    packaging.priceBreaks = priceBreaks;
    ap.packaging.push(packaging);

  }
  const part = tti.parts[0];
  ap.specifications.push(
    part.exportInformation,
    part.environmentalInformation,
    { category: part.category },
  );
  return ap;
}

//Handle final aggregation of both suppliers and create aggregated part
//Generally speaking, I used the leadTime as a decsion point for some more ambigous fields
export function createAggregatedPart(): AggregatedPart {
  const aggregatedPart: AggregatedPart = {
    name: '',
    description: '',
    totalStock: 0,
    manufacturerLeadTime: 0,
    manufacturerName: '',
    packaging: [],
    productDoc: '',
    productUrl: '',
    productImageUrl: '',
    specifications: undefined,
    sourceParts: [],
  };

  aggregatedPart.name = '0510210200';
  aggregatedPart.sourceParts.push('Arrow', 'TTI');
  aggregatedPart.manufacturerName = 'Molex';

  const arrow = handleArrow();
  const tti = handleTTI();

  aggregatedPart.description =
    arrow.manufacturerLeadTime > tti.manufacturerLeadTime
      ? tti.description
      : arrow.description;
  aggregatedPart.totalStock = arrow.totalStock + tti.totalStock;

  aggregatedPart.manufacturerLeadTime = Math.min(
    arrow.manufacturerLeadTime,
    tti.manufacturerLeadTime,
  );
  aggregatedPart.packaging = [...arrow.packaging, ...tti.packaging];
  aggregatedPart.productDoc =
    arrow.manufacturerLeadTime > tti.manufacturerLeadTime
      ? tti.productDoc
      : arrow.productDoc;
  aggregatedPart.productUrl =
    arrow.manufacturerLeadTime > tti.manufacturerLeadTime
      ? tti.productUrl
      : arrow.productUrl;
  aggregatedPart.productImageUrl =
    arrow.manufacturerLeadTime > tti.manufacturerLeadTime
      ? tti.productImageUrl
      : arrow.productImageUrl;

  aggregatedPart.specifications = [
    ...arrow.specifications,
    ...tti.specifications,
  ];
  return aggregatedPart;
}

export class AggregatedPart {
  name: string; // part name
  description: string; // part description
  totalStock: number; // aggregate of total quantity free on hand (foh)/ available
  manufacturerLeadTime: number; // shortest lead time in days
  manufacturerName: string; // manufacturer for part
  packaging: Packaging[]; // collection of various packages available
  productDoc: string; // url to datasheet
  productUrl: string; // url to actual product on website
  productImageUrl: string; // url to product image
  specifications: object[]; // part name collection of specifications if any, [] if none
  sourceParts: SupplierName[]; // collection of suppliers from where data was aggregated
}

export type SupplierName = 'Arrow' | 'TTI';

export class Packaging {
  type: string; // package type (bulk, reel, cut-tape, unspecified, etc)
  minimumOrderQuantity: number; // minimum quantity required to purchase from this package
  quantityAvailable: number; // available stock for this package
  unitPrice: number; // unit price for this package
  supplier: SupplierName; // name of supplier
  priceBreaks: PriceBreak[]; // collection of pricing tiers for this package
  manufacturerLeadTime?: string; // lead time in days
}

export class PriceBreak {
  breakQuantity: number; // minimum quantity in order to reach pricing tier
  unitPrice: number; // price per unit at this tier
  totalPrice: number; // breakQuantity * unitPrice
}
