UPDATE "product_slides"
SET "component_key" = 'GenericCenteredSlide'
WHERE "component_key" IN (
  'HoneSlide1', 'HoneSlide2', 'HoneSlide3', 'HoneSlide4', 'HoneSlide5', 'HoneSlide6', 'HoneSlide7',
  'AmfoSlide1', 'AmfoSlide2', 'AmfoSlide3', 'AmfoSlide4', 'AmfoSlide5', 'AmfoSlide6',
  'LichtaSlide1', 'LichtaSlide3', 'LichtaSlide4', 'LichtaSlide6', 'LichtaSlide7',
  'TinyStepsSlide1', 'TinyStepsSlide2', 'TinyStepsSlide3', 'TinyStepsSlide4', 'TinyStepsSlide5', 'TinyStepsSlide7',
  'TinyStepsViSlide1', 'TinyStepsViSlide2', 'TinyStepsViSlide3', 'TinyStepsViSlide4', 'TinyStepsViSlide5', 'TinyStepsViSlide6',
  'FitFoSlide1', 'FitFoSlide2', 'FitFoSlide3', 'FitFoSlide4', 'FitFoSlide5', 'FitFoSlide6'
);
--> statement-breakpoint
UPDATE "product_slides"
SET "component_key" = 'GenericSideSlide'
WHERE "component_key" IN (
  'LichtaSlide2', 'LichtaSlide5', 'TinyStepsSlide6', 'FitFoSlide7'
);
--> statement-breakpoint
UPDATE "product_slides"
SET "component_key" = 'GenericFeatureListSlide'
WHERE "component_key" IN ('FitFoSlide8');
--> statement-breakpoint
UPDATE "product_slides"
SET "component_key" = 'GenericAndroidCenteredSlide'
WHERE "component_key" IN (
  'LichtaAndroid1', 'LichtaAndroid3', 'LichtaAndroid4', 'LichtaAndroid6', 'LichtaAndroid7'
);
--> statement-breakpoint
UPDATE "product_slides"
SET "component_key" = 'GenericAndroidSideSlide'
WHERE "component_key" IN ('LichtaAndroid2', 'LichtaAndroid5');
