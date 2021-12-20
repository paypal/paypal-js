/**
 * The status of the subscription.
 * @type APPROVAL_PENDING The subscription is created but not yet approved by the buyer.
 * @type APPROVED The buyer has approved the subscription.
 * @type ACTIVE The subscription is active
 * @type SUSPENDED The subscription is suspended.
 * @type CANCELLED The subscription is cancelled.
 * @type EXPIRED he subscription is expired.
 */
export type Status =
    | "APPROVAL_PENDING"
    | "APPROVED"
    | "ACTIVE"
    | "SUSPENDED"
    | "CANCELLED"
    | "EXPIRED";

/**
 * The last actor that updated the subscription.
 * @type SYSTEM The subscription status bas been updated by the system.
 * @type BUYER The subscription status bas been updated by the buyer.
 * @type MERCHANT The subscription status bas been updated by the merchant.
 * @type FACILITATOR The subscription status bas been updated by the facilitator. Facilitators ca be a third party or channel partner that integrates with PayPal.
 */
export type StatusChangedBy = "SYSTEM" | "BUYER" | "MERCHANT" | "FACILITATOR";

/**
 * The status of the captured payment.
 * @type COMPLETED The funds for this captured payment were credited to the payee's PayPal account.
 * @type DECLINED The funds could not be captured.
 * @type PARTIALLY_REFUNDED An amount less than this captured payment's amount was partially refunded to the payer.
 * @type PENDING The funds for this captured payment was not yet credited to the payee's PayPal account.
 * @type REFUNDED There was an error while capturing payment.
 * @type FAILED There was an error while capturing payment.
 */
export type PaymentStatus =
    | "COMPLETED"
    | "DECLINED"
    | "PARTIALLY_REFUNDED"
    | "PENDING"
    | "REFUNDED"
    | "FAILED";

/**
 * The reason code for the payment failure.
 * @type PAYMENT_DENIED PayPal declined the payment due to one or more customer issues.
 * @type INTERNAL_SERVER_ERROR An internal server error has occurred.
 * @type PAYEE_ACCOUNT_RESTRICTED The payee account is not in good standing and cannot receive payments.
 * @type PAYER_ACCOUNT_RESTRICTED The payer account is not in good standing and cannot make payments.
 * @type PAYER_CANNOT_PAY Payer cannot pay for this transaction.
 * @type SENDING_LIMIT_EXCEEDED The transaction exceeds the payer's sending limit.
 * @type TRANSACTION_RECEIVING_LIMIT_EXCEEDED The transaction exceeds the receiver's receiving limit.
 * @type CURRENCY_MISMATCH The transaction is declined due to a currency mismatch.
 */
export type PaymentFailureReason =
    | "PAYMENT_DENIED"
    | "INTERNAL_SERVER_ERROR"
    | "PAYEE_ACCOUNT_RESTRICTED"
    | "PAYER_ACCOUNT_RESTRICTED"
    | "PAYER_CANNOT_PAY"
    | "SENDING_LIMIT_EXCEEDED"
    | "TRANSACTION_RECEIVING_LIMIT_EXCEEDED"
    | "CURRENCY_MISMATCH";

/**
 * A feature capturing variant of a generic product code, when applicable.
 * @type NONE The default value for most payment products.
 * @type ORDERS The payment product featuring order being persisted.
 * @type BILLING_AGREEMENTS The payment product features a billing agreement payment.
 */
export type ProductFeature = "NONE" | "ORDERS" | "BILLING_AGREEMENTS";

/**
 * Identifier for the software that paypal has provided to enable the integration.
 * @type PAYPAL_JS_SDK PayPal's JavaScript SDK, for checkout. This includes PayPal branded payments ( PayPal Wallet, Venmo, PayPal Credit), Alternative payment methods and Hosted card processing capabilities.
 * @type JS_V3 Paypal's client side javascript, Version 3, for checkout.
 * @type JS_V4 Paypal's client side javascript, Version 4, for checkout.
 * @type BRAINTREE_VZERO Use this when Merchant has integrated with an old version of BRAINTREE_VZERO that does not ingest JS_V3 or V4.
 * @type NATIVE_SDK Use this when Merchant has integrated with PayPal's Native Checkout SDK.
 * @type NONE The transaction integration type is not defined.
 */
export type IntegrationArtifact =
    | "PAYPAL_JS_SDK"
    | "JS_V3"
    | "JS_V4"
    | "BRAINTREE_VZERO"
    | "NATIVE_SDK"
    | "NONE";

/**
 * The user experience flow for the PayPal transaction.
 * @type FULL_PAGE_REDIRECT The consumer's browser does a 302 redirect to <a href="https://www.paypal.com/us/home">paypal.com</a> from the third-party site.
 * @type INCONTEXT The buyer interacts with <a href="https://www.paypal.com/us/home">paypal.com</a> in an iframe or pop up window, which is a modal that is outside or hovers over the existing merchant experience.
 * @type INLINE The buyer interacts with <a href="https://www.paypal.com/us/home">paypal.com</a> through an iframe on the merchant site, and is in line with the existing merchant experience.
 * @type NATIVE The buyer interacts with PayPal through PayPal's native SDK.
 * @type FULL_PAGE he buyer interacts with PayPal by opening PayPal.com directly on browser
 */
export type UserExperienceFlow =
    | "FULL_PAGE_REDIRECT"
    | "INCONTEXT"
    | "INLINE"
    | "NATIVE"
    | "FULL_PAGE";

/**
 * The product flow type.
 * @type CLASSIC A legacy checkout API flow.
 * @type HERMES A web application handles the user's checkout interaction.
 * @type PROX An eBay application handles the user's PayPal checkout experience.
 * @type SMART_PAYMENT_BUTTONS A web application handles the user's checkout interaction.
 * @type BUYER_APPROVAL_BILLING_AGREEMENT_CREATE A buyer signing up for a billing agreement
 * @type CONSUMER_EXP_BILLING_AGREEMENT_MODIFY A billing agreement modification flow initiated by consumer on paypal.com
 * @type ONE_TIME_PAYMENT_USING_BILLING_AGREEMENT A flow allowing consumer to change funding for a transaction, while buyer is present for the transaction
 * @type BUYER_APPROVAL_BILLING_AGREEMENT_WITH_PURCHASE A purchase flow which buyer also approves creation of a billing agreement
 * @type BUYER_APPROVAL_SUBSCRIPTIONS A buyer signing up for a Subscription.
 * @type CONSUMER_EXP_SUBSCRIPTIONS_MODIFY A subscription modification flow initiated by consumer on paypal.com.
 * @type BUYER_APPROVAL_SUBSCRIPTIONS_REVISE A subscription modification flow initiated by consumer on merchant site.
 * @type BUYER_APPROVAL_SUBSCRIPTIONS_PRICING_CHANGE A buyer consenting changes made to a plan of the subscription
 * @type BUYER_INSTRUMENT_AUTHENTICATION_BILLING_AGREEMENT Additional factor authentication flow for Billing Agreements.
 * @type NEGATIVE_BALANCE_COLLECTION Collection flow with the system initiating payments to resolve negative balance on sink accounts.
 */
export type ProductFlow =
    | "CLASSIC"
    | "HERMES"
    | "PROX"
    | "SMART_PAYMENT_BUTTONS"
    | "BUYER_APPROVAL_BILLING_AGREEMENT_CREATE"
    | "CONSUMER_EXP_BILLING_AGREEMENT_MODIFY"
    | "ONE_TIME_PAYMENT_USING_BILLING_AGREEMENT"
    | "BUYER_APPROVAL_BILLING_AGREEMENT_WITH_PURCHASE"
    | "BUYER_APPROVAL_SUBSCRIPTIONS"
    | "CONSUMER_EXP_SUBSCRIPTIONS_MODIFY"
    | "BUYER_APPROVAL_SUBSCRIPTIONS_REVISE"
    | "BUYER_APPROVAL_SUBSCRIPTIONS_PRICING_CHANGE"
    | "BUYER_INSTRUMENT_AUTHENTICATION_BILLING_AGREEMENT"
    | "NEGATIVE_BALANCE_COLLECTION";

/**
 * The product type. Indicates whether the product is physical or digital goods, or a service.
 * @type PHYSICAL Physical goods
 * @type DIGITAL Digital goods
 * @type SERVICE Product representing a service. Example: Tech Support
 */
export type ProductType = "PHYSICAL" | "DIGITAL" | "SERVICE";

/**
 * Types of the payment acceptance solution.
 * @type EXPRESS_CHECKOUT The payment acceptance solution is express checkout.
 * @type WEBSITE_PAYMENTS_STANDARD The payment acceptance solution is website payment standard.
 * @type DIRECT_CREDIT_CARD The payment acceptance solution is credit card.
 * @type BILLING_AGREEMENTS The payment acceptance solution is a billing agreement.
 * @type BILLING_SUBSCRIPTIONS Billing plan and subscription solution.
 * @type PAYOUTS MassPay/Payouts solution.
 * @type AUTOWITHDRAWAL Automatic withdrawal initiated to meet a regulatory compliance policy.
 * @type VAULT Paypal Vault solution.
 * @type INVOICING The product code representing invoice payments.
 * @type PAYPAL_IDENTITY_LINKING Paypal Connect payments solution.
 * @type PAYPAL_PRO The payment product features transactions where PayPal collects monthly fees from pro merchants.
 */
export type ProductCode =
    | "EXPRESS_CHECKOUT"
    | "WEBSITE_PAYMENTS_STANDARD"
    | "DIRECT_CREDIT_CARD"
    | "BILLING_AGREEMENTS"
    | "BILLING_SUBSCRIPTIONS"
    | "PAYOUTS"
    | "AUTOWITHDRAWAL"
    | "VAULT"
    | "INVOICING"
    | "PAYPAL_IDENTITY_LINKING"
    | "PAYPAL_PRO";

export type API =
    | "PAYMENTS_V1"
    | "ORDERS_V1"
    | "ORDERS_V2"
    | "LEGACY_CHECKOUT_API"
    | "BILLING_V1"
    | "VAULT_V2"
    | "IDENTITY"
    | "INVOICING_V1"
    | "INVOICING_V2"
    | "LEGACY_BILLING_API"
    | "LEGACY_BILLING_CBA_API"
    | "SUBSCRIPTIONS_V1"
    | "RECURRING_PAYMENTS_V1"
    | "LEGACY_RECURRING_PAYMENTS"
    | "NONE";

/**
 * The payment method.
 * @type PAY_WITH_VENMO The transaction is initiated from Venmo.
 * @type PAY_WITH_CARD The transaction is initiated from a credit card.
 * @type PAY_WITH_PAYPAL The transaction is initiated from PayPal.
 * @type PAY_WITH_PAYPAL_CREDIT The transaction is initiated from PayPal credit.
 * @type PAY_WITH_SEPA The transaction is initiated from Pay With SEPA.
 * @type PAY_WITH_ALTPAY_ALIPAY The transaction is initiated from Alternative Payment AliPay.
 * @type PAY_WITH_ALTPAY_BANCONTACT The transaction is initiated from Alternative Payment Bancontact.
 * @type PAY_WITH_ALTPAY_BOLETO The transaction is initiated from Alternative Payment Boleto.
 * @type PAY_WITH_ALTPAY_EPS The transaction is initiated from Alternative Payment EPS.
 * @type PAY_WITH_ALTPAY_GIROPAY The transaction is initiated from Alternative Payment Giropay.
 * @type PAY_WITH_ALTPAY_IDEAL The transaction is initiated from Alternative Payment iDeal.
 * @type PAY_WITH_ALTPAY_MYBANK The transaction is initiated from Alternative Payment MyBank.
 * @type PAY_WITH_ALTPAY_OXXO The transaction is initiated from Alternative Payment OXXO.
 * @type PAY_WITH_ALTPAY_P24 The transaction is initiated from Alternative Payment P24.
 * @type PAY_WITH_ALTPAY_SOFORT The transaction is initiated from Alternative Payment Sofort.
 * @type PAY_WITH_ALTPAY_WECHATPAY The transaction is initiated from Alternative Payment WeChatPay.
 * @type PAY_WITH_ALTPAY_ZIMPLER The transaction is initiated from Alternative Payment Zimpler.
 * @type UNKNOWN The transaction source is unknown.
 */
export type Payment =
    | "PAY_WITH_VENMO"
    | "PAY_WITH_CARD"
    | "PAY_WITH_PAYPAL"
    | "PAY_WITH_PAYPAL_CREDIT"
    | "PAY_WITH_SEPA"
    | "PAY_WITH_ALTPAY_ALIPAY"
    | "PAY_WITH_ALTPAY_BANCONTACT"
    | "PAY_WITH_ALTPAY_BOLETO"
    | "PAY_WITH_ALTPAY_EPS"
    | "PAY_WITH_ALTPAY_GIROPAY"
    | "PAY_WITH_ALTPAY_IDEAL"
    | "PAY_WITH_ALTPAY_MYBANK"
    | "PAY_WITH_ALTPAY_OXXO"
    | "PAY_WITH_ALTPAY_P24"
    | "PAY_WITH_ALTPAY_SOFORT"
    | "PAY_WITH_ALTPAY_WECHATPAY"
    | "PAY_WITH_ALTPAY_ZIMPLER"
    | "UNKNOWN";

export type Category =
    | "AC_REFRIGERATION_REPAIR"
    | "ACADEMIC_SOFTWARE"
    | "ACCESSORIES"
    | "ACCOUNTING"
    | "ADULT"
    | "ADVERTISING"
    | "AFFILIATED_AUTO_RENTAL"
    | "AGENCIES"
    | "AGGREGATORS"
    | "AGRICULTURAL_COOPERATIVE_FOR_MAIL_ORDER"
    | "AIR_CARRIERS_AIRLINES"
    | "AIRLINES"
    | "AIRPORTS_FLYING_FIELDS"
    | "ALCOHOLIC_BEVERAGES"
    | "AMUSEMENT_PARKS_CARNIVALS"
    | "ANIMATION"
    | "ANTIQUES"
    | "APPLIANCES"
    | "AQUARIAMS_SEAQUARIUMS_DOLPHINARIUMS"
    | "ARCHITECTURAL_ENGINEERING_AND_SURVEYING_SERVICES"
    | "ART_AND_CRAFT_SUPPLIES"
    | "ART_DEALERS_AND_GALLERIES"
    | "ARTIFACTS_GRAVE_RELATED_AND_NATIVE_AMERICAN_CRAFTS"
    | "ARTS_AND_CRAFTS"
    | "ARTS_CRAFTS_AND_COLLECTIBLES"
    | "AUDIO_BOOKS"
    | "AUTO_ASSOCIATIONS_CLUBS"
    | "AUTO_DEALER_USED_ONLY"
    | "AUTO_RENTALS"
    | "AUTO_SERVICE"
    | "AUTOMATED_FUEL_DISPENSERS"
    | "AUTOMOBILE_ASSOCIATIONS"
    | "AUTOMOTIVE"
    | "AUTOMOTIVE_REPAIR_SHOPS_NON_DEALER"
    | "AUTOMOTIVE_TOP_AND_BODY_SHOPS"
    | "AVIATION"
    | "BABIES_CLOTHING_AND_SUPPLIES"
    | "BABY"
    | "BANDS_ORCHESTRAS_ENTERTAINERS"
    | "BARBIES"
    | "BATH_AND_BODY"
    | "BATTERIES"
    | "BEAN_BABIES"
    | "BEAUTY"
    | "BEAUTY_AND_FRAGRANCES"
    | "BED_AND_BATH"
    | "BICYCLE_SHOPS_SALES_AND_SERVICE"
    | "BICYCLES_AND_ACCESSORIES"
    | "BILLIARD_POOL_ESTABLISHMENTS"
    | "BOAT_DEALERS"
    | "BOAT_RENTALS_AND_LEASING"
    | "BOATING_SAILING_AND_ACCESSORIES"
    | "BOOKS"
    | "BOOKS_AND_MAGAZINES"
    | "BOOKS_MANUSCRIPTS"
    | "BOOKS_PERIODICALS_AND_NEWSPAPERS"
    | "BOWLING_ALLEYS"
    | "BULLETIN_BOARD"
    | "BUS_LINE"
    | "BUS_LINES_CHARTERS_TOUR_BUSES"
    | "BUSINESS"
    | "BUSINESS_AND_SECRETARIAL_SCHOOLS"
    | "BUYING_AND_SHOPPING_SERVICES_AND_CLUBS"
    | "CABLE_SATELLITE_AND_OTHER_PAY_TELEVISION_AND_RADIO_SERVICES"
    | "CABLE_SATELLITE_AND_OTHER_PAY_TV_AND_RADIO"
    | "CAMERA_AND_PHOTOGRAPHIC_SUPPLIES"
    | "CAMERAS"
    | "CAMERAS_AND_PHOTOGRAPHY"
    | "CAMPER_RECREATIONAL_AND_UTILITY_TRAILER_DEALERS"
    | "CAMPING_AND_OUTDOORS"
    | "CAMPING_AND_SURVIVAL"
    | "CAR_AND_TRUCK_DEALERS"
    | "CAR_AND_TRUCK_DEALERS_USED_ONLY"
    | "CAR_AUDIO_AND_ELECTRONICS"
    | "CAR_RENTAL_AGENCY"
    | "CATALOG_MERCHANT"
    | "CATALOG_RETAIL_MERCHANT"
    | "CATERING_SERVICES"
    | "CHARITY"
    | "CHECK_CASHIER"
    | "CHILD_CARE_SERVICES"
    | "CHILDREN_BOOKS"
    | "CHIROPODISTS_PODIATRISTS"
    | "CHIROPRACTORS"
    | "CIGAR_STORES_AND_STANDS"
    | "CIVIC_SOCIAL_FRATERNAL_ASSOCIATIONS"
    | "CIVIL_SOCIAL_FRAT_ASSOCIATIONS"
    | "CLOTHING"
    | "CLOTHING_ACCESSORIES_AND_SHOES"
    | "CLOTHING_RENTAL"
    | "COFFEE_AND_TEA"
    | "COIN_OPERATED_BANKS_AND_CASINOS"
    | "COLLECTIBLES"
    | "COLLECTION_AGENCY"
    | "COLLEGES_AND_UNIVERSITIES"
    | "COMMERCIAL_EQUIPMENT"
    | "COMMERCIAL_FOOTWEAR"
    | "COMMERCIAL_PHOTOGRAPHY"
    | "COMMERCIAL_PHOTOGRAPHY_ART_AND_GRAPHICS"
    | "COMMERCIAL_SPORTS_PROFESSIONA"
    | "COMMODITIES_AND_FUTURES_EXCHANGE"
    | "COMPUTER_AND_DATA_PROCESSING_SERVICES"
    | "COMPUTER_HARDWARE_AND_SOFTWARE"
    | "COMPUTER_MAINTENANCE_REPAIR_AND_SERVICES_NOT_ELSEWHERE_CLAS"
    | "CONSTRUCTION"
    | "CONSTRUCTION_MATERIALS_NOT_ELSEWHERE_CLASSIFIED"
    | "CONSULTING_SERVICES"
    | "CONSUMER_CREDIT_REPORTING_AGENCIES"
    | "CONVALESCENT_HOMES"
    | "COSMETIC_STORES"
    | "COUNSELING_SERVICES_DEBT_MARRIAGE_PERSONAL"
    | "COUNTERFEIT_CURRENCY_AND_STAMPS"
    | "COUNTERFEIT_ITEMS"
    | "COUNTRY_CLUBS"
    | "COURIER_SERVICES"
    | "COURIER_SERVICES_AIR_AND_GROUND_AND_FREIGHT_FORWARDERS"
    | "COURT_COSTS_ALIMNY_CHILD_SUPT"
    | "COURT_COSTS_INCLUDING_ALIMONY_AND_CHILD_SUPPORT_COURTS_OF_LAW"
    | "CREDIT_CARDS"
    | "CREDIT_UNION"
    | "CULTURE_AND_RELIGION"
    | "DAIRY_PRODUCTS_STORES"
    | "DANCE_HALLS_STUDIOS_AND_SCHOOLS"
    | "DECORATIVE"
    | "DENTAL"
    | "DENTISTS_AND_ORTHODONTISTS"
    | "DEPARTMENT_STORES"
    | "DESKTOP_PCS"
    | "DEVICES"
    | "DIECAST_TOYS_VEHICLES"
    | "DIGITAL_GAMES"
    | "DIGITAL_MEDIA_BOOKS_MOVIES_MUSIC"
    | "DIRECT_MARKETING"
    | "DIRECT_MARKETING_CATALOG_MERCHANT"
    | "DIRECT_MARKETING_INBOUND_TELE"
    | "DIRECT_MARKETING_OUTBOUND_TELE"
    | "DIRECT_MARKETING_SUBSCRIPTION"
    | "DISCOUNT_STORES"
    | "DOOR_TO_DOOR_SALES"
    | "DRAPERY_WINDOW_COVERING_AND_UPHOLSTERY"
    | "DRINKING_PLACES"
    | "DRUGSTORE"
    | "DURABLE_GOODS"
    | "ECOMMERCE_DEVELOPMENT"
    | "ECOMMERCE_SERVICES"
    | "EDUCATIONAL_AND_TEXTBOOKS"
    | "ELECTRIC_RAZOR_STORES"
    | "ELECTRICAL_AND_SMALL_APPLIANCE_REPAIR"
    | "ELECTRICAL_CONTRACTORS"
    | "ELECTRICAL_PARTS_AND_EQUIPMENT"
    | "ELECTRONIC_CASH"
    | "ELEMENTARY_AND_SECONDARY_SCHOOLS"
    | "EMPLOYMENT"
    | "ENTERTAINERS"
    | "ENTERTAINMENT_AND_MEDIA"
    | "EQUIP_TOOL_FURNITURE_AND_APPLIANCE_RENTAL_AND_LEASING"
    | "ESCROW"
    | "EVENT_AND_WEDDING_PLANNING"
    | "EXERCISE_AND_FITNESS"
    | "EXERCISE_EQUIPMENT"
    | "EXTERMINATING_AND_DISINFECTING_SERVICES"
    | "FABRICS_AND_SEWING"
    | "FAMILY_CLOTHING_STORES"
    | "FASHION_JEWELRY"
    | "FAST_FOOD_RESTAURANTS"
    | "FICTION_AND_NONFICTION"
    | "FINANCE_COMPANY"
    | "FINANCIAL_AND_INVESTMENT_ADVICE"
    | "FINANCIAL_INSTITUTIONS_MERCHANDISE_AND_SERVICES"
    | "FIREARM_ACCESSORIES"
    | "FIREARMS_WEAPONS_AND_KNIVES"
    | "FIREPLACE_AND_FIREPLACE_SCREENS"
    | "FIREWORKS"
    | "FISHING"
    | "FLORISTS"
    | "FLOWERS"
    | "FOOD_DRINK_AND_NUTRITION"
    | "FOOD_PRODUCTS"
    | "FOOD_RETAIL_AND_SERVICE"
    | "FRAGRANCES_AND_PERFUMES"
    | "FREEZER_AND_LOCKER_MEAT_PROVISIONERS"
    | "FUEL_DEALERS_FUEL_OIL_WOOD_AND_COAL"
    | "FUEL_DEALERS_NON_AUTOMOTIVE"
    | "FUNERAL_SERVICES_AND_CREMATORIES"
    | "FURNISHING_AND_DECORATING"
    | "FURNITURE"
    | "FURRIERS_AND_FUR_SHOPS"
    | "GADGETS_AND_OTHER_ELECTRONICS"
    | "GAMBLING"
    | "GAME_SOFTWARE"
    | "GAMES"
    | "GARDEN_SUPPLIES"
    | "GENERAL"
    | "GENERAL_CONTRACTORS"
    | "GENERAL_GOVERNMENT"
    | "GENERAL_SOFTWARE"
    | "GENERAL_TELECOM"
    | "GIFTS_AND_FLOWERS"
    | "GLASS_PAINT_AND_WALLPAPER_STORES"
    | "GLASSWARE_CRYSTAL_STORES"
    | "GOVERNMENT"
    | "GOVERNMENT_IDS_AND_LICENSES"
    | "GOVERNMENT_LICENSED_ON_LINE_CASINOS_ON_LINE_GAMBLING"
    | "GOVERNMENT_OWNED_LOTTERIES"
    | "GOVERNMENT_SERVICES"
    | "GRAPHIC_AND_COMMERCIAL_DESIGN"
    | "GREETING_CARDS"
    | "GROCERY_STORES_AND_SUPERMARKETS"
    | "HARDWARE_AND_TOOLS"
    | "HARDWARE_EQUIPMENT_AND_SUPPLIES"
    | "HAZARDOUS_RESTRICTED_AND_PERISHABLE_ITEMS"
    | "HEALTH_AND_BEAUTY_SPAS"
    | "HEALTH_AND_NUTRITION"
    | "HEALTH_AND_PERSONAL_CARE"
    | "HEARING_AIDS_SALES_AND_SUPPLIES"
    | "HEATING_PLUMBING_AC"
    | "HIGH_RISK_MERCHANT"
    | "HIRING_SERVICES"
    | "HOBBIES_TOYS_AND_GAMES"
    | "HOME_AND_GARDEN"
    | "HOME_AUDIO"
    | "HOME_DECOR"
    | "HOME_ELECTRONICS"
    | "HOSPITALS"
    | "HOTELS_MOTELS_INNS_RESORTS"
    | "HOUSEWARES"
    | "HUMAN_PARTS_AND_REMAINS"
    | "HUMOROUS_GIFTS_AND_NOVELTIES"
    | "HUNTING"
    | "IDS_LICENSES_AND_PASSPORTS"
    | "ILLEGAL_DRUGS_AND_PARAPHERNALIA"
    | "INDUSTRIAL"
    | "INDUSTRIAL_AND_MANUFACTURING_SUPPLIES"
    | "INSURANCE_AUTO_AND_HOME"
    | "INSURANCE_DIRECT"
    | "INSURANCE_LIFE_AND_ANNUITY"
    | "INSURANCE_SALES_UNDERWRITING"
    | "INSURANCE_UNDERWRITING_PREMIUMS"
    | "INTERNET_AND_NETWORK_SERVICES"
    | "INTRA_COMPANY_PURCHASES"
    | "LABORATORIES_DENTAL_MEDICAL"
    | "LANDSCAPING"
    | "LANDSCAPING_AND_HORTICULTURAL_SERVICES"
    | "LAUNDRY_CLEANING_SERVICES"
    | "LEGAL"
    | "LEGAL_SERVICES_AND_ATTORNEYS"
    | "LOCAL_DELIVERY_SERVICE"
    | "LOCKSMITH"
    | "LODGING_AND_ACCOMMODATIONS"
    | "LOTTERY_AND_CONTESTS"
    | "LUGGAGE_AND_LEATHER_GOODS"
    | "LUMBER_AND_BUILDING_MATERIALS"
    | "MAGAZINES"
    | "MAINTENANCE_AND_REPAIR_SERVICES"
    | "MAKEUP_AND_COSMETICS"
    | "MANUAL_CASH_DISBURSEMENTS"
    | "MASSAGE_PARLORS"
    | "MEDICAL"
    | "MEDICAL_AND_PHARMACEUTICAL"
    | "MEDICAL_CARE"
    | "MEDICAL_EQUIPMENT_AND_SUPPLIES"
    | "MEDICAL_SERVICES"
    | "MEETING_PLANNERS"
    | "MEMBERSHIP_CLUBS_AND_ORGANIZATIONS"
    | "MEMBERSHIP_COUNTRY_CLUBS_GOLF"
    | "MEMORABILIA"
    | "MEN_AND_BOY_CLOTHING_AND_ACCESSORY_STORES"
    | "MEN_CLOTHING"
    | "MERCHANDISE"
    | "METAPHYSICAL"
    | "MILITARIA"
    | "MILITARY_AND_CIVIL_SERVICE_UNIFORMS"
    | "MISC._AUTOMOTIVE_AIRCRAFT_AND_FARM_EQUIPMENT_DEALERS"
    | "MISC._GENERAL_MERCHANDISE"
    | "MISCELLANEOUS_GENERAL_SERVICES"
    | "MISCELLANEOUS_REPAIR_SHOPS_AND_RELATED_SERVICES"
    | "MODEL_KITS"
    | "MONEY_TRANSFER_MEMBER_FINANCIAL_INSTITUTION"
    | "MONEY_TRANSFER_MERCHANT"
    | "MOTION_PICTURE_THEATERS"
    | "MOTOR_FREIGHT_CARRIERS_AND_TRUCKING"
    | "MOTOR_HOME_AND_RECREATIONAL_VEHICLE_RENTAL"
    | "MOTOR_HOMES_DEALERS"
    | "MOTOR_VEHICLE_SUPPLIES_AND_NEW_PARTS"
    | "MOTORCYCLE_DEALERS"
    | "MOTORCYCLES"
    | "MOVIE"
    | "MOVIE_TICKETS"
    | "MOVING_AND_STORAGE"
    | "MULTI_LEVEL_MARKETING"
    | "MUSIC_CDS_CASSETTES_AND_ALBUMS"
    | "MUSIC_STORE_INSTRUMENTS_AND_SHEET_MUSIC"
    | "NETWORKING"
    | "NEW_AGE"
    | "NEW_PARTS_AND_SUPPLIES_MOTOR_VEHICLE"
    | "NEWS_DEALERS_AND_NEWSTANDS"
    | "NON_DURABLE_GOODS"
    | "NON_FICTION"
    | "NON_PROFIT_POLITICAL_AND_RELIGION"
    | "NONPROFIT"
    | "NOVELTIES"
    | "OEM_SOFTWARE"
    | "OFFICE_SUPPLIES_AND_EQUIPMENT"
    | "ONLINE_DATING"
    | "ONLINE_GAMING"
    | "ONLINE_GAMING_CURRENCY"
    | "ONLINE_SERVICES"
    | "OOUTBOUND_TELEMARKETING_MERCH"
    | "OPHTHALMOLOGISTS_OPTOMETRIST"
    | "OPTICIANS_AND_DISPENSING"
    | "ORTHOPEDIC_GOODS_PROSTHETICS"
    | "OSTEOPATHS"
    | "OTHER"
    | "PACKAGE_TOUR_OPERATORS"
    | "PAINTBALL"
    | "PAINTS_VARNISHES_AND_SUPPLIES"
    | "PARKING_LOTS_AND_GARAGES"
    | "PARTS_AND_ACCESSORIES"
    | "PAWN_SHOPS"
    | "PAYCHECK_LENDER_OR_CASH_ADVANCE"
    | "PERIPHERALS"
    | "PERSONALIZED_GIFTS"
    | "PET_SHOPS_PET_FOOD_AND_SUPPLIES"
    | "PETROLEUM_AND_PETROLEUM_PRODUCTS"
    | "PETS_AND_ANIMALS"
    | "PHOTOFINISHING_LABORATORIES_PHOTO_DEVELOPING"
    | "PHOTOGRAPHIC_STUDIOS_PORTRAITS"
    | "PHOTOGRAPHY"
    | "PHYSICAL_GOOD"
    | "PICTURE_VIDEO_PRODUCTION"
    | "PIECE_GOODS_NOTIONS_AND_OTHER_DRY_GOODS"
    | "PLANTS_AND_SEEDS"
    | "PLUMBING_AND_HEATING_EQUIPMENTS_AND_SUPPLIES"
    | "POLICE_RELATED_ITEMS"
    | "POLITICAL_ORGANIZATIONS"
    | "POSTAL_SERVICES_GOVERNMENT_ONLY"
    | "POSTERS"
    | "PREPAID_AND_STORED_VALUE_CARDS"
    | "PRESCRIPTION_DRUGS"
    | "PROMOTIONAL_ITEMS"
    | "PUBLIC_WAREHOUSING_AND_STORAGE"
    | "PUBLISHING_AND_PRINTING"
    | "PUBLISHING_SERVICES"
    | "RADAR_DECTORS"
    | "RADIO_TELEVISION_AND_STEREO_REPAIR"
    | "REAL_ESTATE"
    | "REAL_ESTATE_AGENT"
    | "REAL_ESTATE_AGENTS_AND_MANAGERS_RENTALS"
    | "RELIGION_AND_SPIRITUALITY_FOR_PROFIT"
    | "RELIGIOUS"
    | "RELIGIOUS_ORGANIZATIONS"
    | "REMITTANCE"
    | "RENTAL_PROPERTY_MANAGEMENT"
    | "RESIDENTIAL"
    | "RETAIL"
    | "RETAIL_FINE_JEWELRY_AND_WATCHES"
    | "REUPHOLSTERY_AND_FURNITURE_REPAIR"
    | "RINGS"
    | "ROOFING_SIDING_SHEET_METAL"
    | "RUGS_AND_CARPETS"
    | "SCHOOLS_AND_COLLEGES"
    | "SCIENCE_FICTION"
    | "SCRAPBOOKING"
    | "SCULPTURES"
    | "SECURITIES_BROKERS_AND_DEALERS"
    | "SECURITY_AND_SURVEILLANCE"
    | "SECURITY_AND_SURVEILLANCE_EQUIPMENT"
    | "SECURITY_BROKERS_AND_DEALERS"
    | "SEMINARS"
    | "SERVICE_STATIONS"
    | "SERVICES"
    | "SEWING_NEEDLEWORK_FABRIC_AND_PIECE_GOODS_STORES"
    | "SHIPPING_AND_PACKING"
    | "SHOE_REPAIR_HAT_CLEANING"
    | "SHOE_STORES"
    | "SHOES"
    | "SNOWMOBILE_DEALERS"
    | "SOFTWARE"
    | "SPECIALTY_AND_MISC._FOOD_STORES"
    | "SPECIALTY_CLEANING_POLISHING_AND_SANITATION_PREPARATIONS"
    | "SPECIALTY_OR_RARE_PETS"
    | "SPORT_GAMES_AND_TOYS"
    | "SPORTING_AND_RECREATIONAL_CAMPS"
    | "SPORTING_GOODS"
    | "SPORTS_AND_OUTDOORS"
    | "SPORTS_AND_RECREATION"
    | "STAMP_AND_COIN"
    | "STATIONARY_PRINTING_AND_WRITING_PAPER"
    | "STENOGRAPHIC_AND_SECRETARIAL_SUPPORT_SERVICES"
    | "STOCKS_BONDS_SECURITIES_AND_RELATED_CERTIFICATES"
    | "STORED_VALUE_CARDS"
    | "SUPPLIES"
    | "SUPPLIES_AND_TOYS"
    | "SURVEILLANCE_EQUIPMENT"
    | "SWIMMING_POOLS_AND_SPAS"
    | "SWIMMING_POOLS_SALES_SUPPLIES_SERVICES"
    | "TAILORS_AND_ALTERATIONS"
    | "TAX_PAYMENTS"
    | "TAX_PAYMENTS_GOVERNMENT_AGENCIES"
    | "TAXICABS_AND_LIMOUSINES"
    | "TELECOMMUNICATION_SERVICES"
    | "TELEPHONE_CARDS"
    | "TELEPHONE_EQUIPMENT"
    | "TELEPHONE_SERVICES"
    | "THEATER"
    | "TIRE_RETREADING_AND_REPAIR"
    | "TOLL_OR_BRIDGE_FEES"
    | "TOOLS_AND_EQUIPMENT"
    | "TOURIST_ATTRACTIONS_AND_EXHIBITS"
    | "TOWING_SERVICE"
    | "TOYS_AND_GAMES"
    | "TRADE_AND_VOCATIONAL_SCHOOLS"
    | "TRADEMARK_INFRINGEMENT"
    | "TRAILER_PARKS_AND_CAMPGROUNDS"
    | "TRAINING_SERVICES"
    | "TRANSPORTATION_SERVICES"
    | "TRAVEL"
    | "TRUCK_AND_UTILITY_TRAILER_RENTALS"
    | "TRUCK_STOP"
    | "TYPESETTING_PLATE_MAKING_AND_RELATED_SERVICES"
    | "USED_MERCHANDISE_AND_SECONDHAND_STORES"
    | "USED_PARTS_MOTOR_VEHICLE"
    | "UTILITIES"
    | "UTILITIES_ELECTRIC_GAS_WATER_SANITARY"
    | "VARIETY_STORES"
    | "VEHICLE_SALES"
    | "VEHICLE_SERVICE_AND_ACCESSORIES"
    | "VIDEO_EQUIPMENT"
    | "VIDEO_GAME_ARCADES_ESTABLISH"
    | "VIDEO_GAMES_AND_SYSTEMS"
    | "VIDEO_TAPE_RENTAL_STORES"
    | "VINTAGE_AND_COLLECTIBLE_VEHICLES"
    | "VINTAGE_AND_COLLECTIBLES"
    | "VITAMINS_AND_SUPPLEMENTS"
    | "VOCATIONAL_AND_TRADE_SCHOOLS"
    | "WATCH_CLOCK_AND_JEWELRY_REPAIR"
    | "WEB_HOSTING_AND_DESIGN"
    | "WELDING_REPAIR"
    | "WHOLESALE_CLUBS"
    | "WHOLESALE_FLORIST_SUPPLIERS"
    | "WHOLESALE_PRESCRIPTION_DRUGS"
    | "WILDLIFE_PRODUCTS"
    | "WIRE_TRANSFER"
    | "WIRE_TRANSFER_AND_MONEY_ORDER"
    | "WOMEN_ACCESSORY_SPECIALITY"
    | "WOMEN_CLOTHING";
