PGDMP  "                 	    |           field_hive_development    16.3    16.4 �               0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    16411    field_hive_development    DATABASE     �   CREATE DATABASE field_hive_development WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';
 &   DROP DATABASE field_hive_development;
                superdangerbro    false                       0    0    field_hive_development    DATABASE PROPERTIES     a   ALTER DATABASE field_hive_development SET search_path TO '$user', 'public', 'topology', 'tiger';
                     superdangerbro    false                        2615    17744    tiger    SCHEMA        CREATE SCHEMA tiger;
    DROP SCHEMA tiger;
                rdsadmin    false                        3079    17720    fuzzystrmatch 	   EXTENSION     A   CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;
    DROP EXTENSION fuzzystrmatch;
                   false                       0    0    EXTENSION fuzzystrmatch    COMMENT     ]   COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';
                        false    4                        3079    16470    postgis 	   EXTENSION     ;   CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
    DROP EXTENSION postgis;
                   false                       0    0    EXTENSION postgis    COMMENT     ^   COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';
                        false    2                        3079    17745    postgis_tiger_geocoder 	   EXTENSION     I   CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;
 '   DROP EXTENSION postgis_tiger_geocoder;
                   false    4    2    12                       0    0     EXTENSION postgis_tiger_geocoder    COMMENT     ^   COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';
                        false    5                        2615    17548    topology    SCHEMA        CREATE SCHEMA topology;
    DROP SCHEMA topology;
                rdsadmin    false                       0    0    SCHEMA topology    COMMENT     9   COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';
                   rdsadmin    false    11                        3079    17549    postgis_topology 	   EXTENSION     F   CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;
 !   DROP EXTENSION postgis_topology;
                   false    2    11                       0    0    EXTENSION postgis_topology    COMMENT     Y   COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';
                        false    3                        3079    18291 	   uuid-ossp 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
    DROP EXTENSION "uuid-ossp";
                   false                       0    0    EXTENSION "uuid-ossp"    COMMENT     W   COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';
                        false    6                       1247    19160    equipment_status_enum    TYPE     q   CREATE TYPE public.equipment_status_enum AS ENUM (
    'active',
    'maintenance',
    'retired',
    'lost'
);
 (   DROP TYPE public.equipment_status_enum;
       public          superdangerbro    false            �           1255    19799    update_jobs_updated_at()    FUNCTION     �   CREATE FUNCTION public.update_jobs_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$;
 /   DROP FUNCTION public.update_jobs_updated_at();
       public          superdangerbro    false            �           1255    18609    update_updated_at_column()    FUNCTION     �   CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$;
 1   DROP FUNCTION public.update_updated_at_column();
       public          superdangerbro    false            1           1259    19333    account_billing_address    TABLE       CREATE TABLE public.account_billing_address (
    address_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    account_id uuid NOT NULL,
    address1 character varying(255) NOT NULL,
    address2 character varying(255),
    city character varying(100) NOT NULL,
    province character varying(100) NOT NULL,
    "postalCode" character varying(20) NOT NULL,
    country character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 +   DROP TABLE public.account_billing_address;
       public         heap    superdangerbro    false    6                       1259    18302    accounts    TABLE       CREATE TABLE public.accounts (
    account_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    is_company boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying
);
    DROP TABLE public.accounts;
       public         heap    superdangerbro    false    6            0           1259    19307    accounts_contacts_join    TABLE       CREATE TABLE public.accounts_contacts_join (
    account_id uuid NOT NULL,
    contact_id uuid NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 *   DROP TABLE public.accounts_contacts_join;
       public         heap    superdangerbro    false            3           1259    19746 	   addresses    TABLE       CREATE TABLE public.addresses (
    address_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    address1 character varying(255) NOT NULL,
    address2 character varying(255),
    city character varying(255) NOT NULL,
    province character varying(255) NOT NULL,
    postal_code character varying(255) NOT NULL,
    country character varying(255) NOT NULL,
    label character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.addresses;
       public         heap    superdangerbro    false    6                       1259    18162    ar_internal_metadata    TABLE     �   CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);
 (   DROP TABLE public.ar_internal_metadata;
       public         heap    superdangerbro    false            &           1259    18502    beaver_trap_types    TABLE     �   CREATE TABLE public.beaver_trap_types (
    beaver_trap_type_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    beaver_trap_type character varying NOT NULL
);
 %   DROP TABLE public.beaver_trap_types;
       public         heap    superdangerbro    false    6            %           1259    18492    beaver_traps    TABLE     k   CREATE TABLE public.beaver_traps (
    beaver_trap_id uuid NOT NULL,
    beaver_trap_type uuid NOT NULL
);
     DROP TABLE public.beaver_traps;
       public         heap    superdangerbro    false            "           1259    18375    contacts    TABLE     |   CREATE TABLE public.contacts (
    contact_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL
);
    DROP TABLE public.contacts;
       public         heap    superdangerbro    false    6            (           1259    18563    equipment_inspections    TABLE     �  CREATE TABLE public.equipment_inspections (
    inspection_id uuid NOT NULL,
    equipment_id uuid NOT NULL,
    inspected_by uuid NOT NULL,
    barcode character varying,
    notes character varying,
    image_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    status public.equipment_status_enum NOT NULL
);
 )   DROP TABLE public.equipment_inspections;
       public         heap    superdangerbro    false    2077            )           1259    18583    equipment_statuses    TABLE     z   CREATE TABLE public.equipment_statuses (
    status_id uuid NOT NULL,
    status public.equipment_status_enum NOT NULL
);
 &   DROP TABLE public.equipment_statuses;
       public         heap    superdangerbro    false    2077            5           1259    19801    field_equipment    TABLE     �  CREATE TABLE public.field_equipment (
    equipment_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid NOT NULL,
    equipment_type_id text NOT NULL,
    location public.geometry(Point,4326),
    is_georeferenced boolean DEFAULT true,
    status text DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
 #   DROP TABLE public.field_equipment;
       public         heap    superdangerbro    false    6    2    2    2    2    2    2    2    2            4           1259    19773    jobs    TABLE     J  CREATE TABLE public.jobs (
    job_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_type_id text NOT NULL,
    property_id uuid NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT jobs_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);
    DROP TABLE public.jobs;
       public         heap    superdangerbro    false    6            $           1259    18482    large_stations    TABLE     m   CREATE TABLE public.large_stations (
    large_station_id uuid NOT NULL,
    target_species uuid NOT NULL
);
 "   DROP TABLE public.large_stations;
       public         heap    superdangerbro    false            ,           1259    19149 
   migrations    TABLE     �   CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);
    DROP TABLE public.migrations;
       public         heap    superdangerbro    false            +           1259    19148    migrations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.migrations_id_seq;
       public          superdangerbro    false    300                       0    0    migrations_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;
          public          superdangerbro    false    299                        1259    18323 
   properties    TABLE       CREATE TABLE public.properties (
    property_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name character varying(255) NOT NULL,
    location public.geometry(Point,4326),
    boundary public.geometry(Polygon,4326),
    status character varying(50) DEFAULT 'active'::character varying,
    type character varying(50) DEFAULT 'residential'::character varying NOT NULL,
    address1 character varying(255),
    address2 character varying(255),
    city character varying(100),
    province character varying(100),
    postal_code character varying(20),
    country character varying(100),
    billing_address_id uuid
);
    DROP TABLE public.properties;
       public         heap    superdangerbro    false    6    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2            /           1259    19290    properties_accounts_join    TABLE       CREATE TABLE public.properties_accounts_join (
    property_id uuid NOT NULL,
    account_id uuid NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 ,   DROP TABLE public.properties_accounts_join;
       public         heap    superdangerbro    false            2           1259    19350    property_billing_address    TABLE     �  CREATE TABLE public.property_billing_address (
    address_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_id uuid NOT NULL,
    use_account_billing boolean DEFAULT false,
    account_id uuid,
    address1 character varying(255),
    address2 character varying(255),
    city character varying(100),
    province character varying(100),
    "postalCode" character varying(20),
    country character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_billing_source CHECK ((((use_account_billing = true) AND (account_id IS NOT NULL) AND (address1 IS NULL) AND (city IS NULL) AND (province IS NULL) AND ("postalCode" IS NULL) AND (country IS NULL)) OR ((use_account_billing = false) AND (account_id IS NULL) AND (address1 IS NOT NULL) AND (city IS NOT NULL) AND (province IS NOT NULL) AND ("postalCode" IS NOT NULL) AND (country IS NOT NULL))))
);
 ,   DROP TABLE public.property_billing_address;
       public         heap    superdangerbro    false    6            '           1259    18517    rodent_species    TABLE     �   CREATE TABLE public.rodent_species (
    rodent_species_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    rodent_species_name character varying(100) NOT NULL
);
 "   DROP TABLE public.rodent_species;
       public         heap    superdangerbro    false    6                       1259    18155    schema_migrations    TABLE     R   CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);
 %   DROP TABLE public.schema_migrations;
       public         heap    superdangerbro    false            6           1259    19823    settings    TABLE     "  CREATE TABLE public.settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    key character varying(255) NOT NULL,
    value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.settings;
       public         heap    superdangerbro    false    6            #           1259    18472    small_station    TABLE     l   CREATE TABLE public.small_station (
    small_station_id uuid NOT NULL,
    target_species uuid NOT NULL
);
 !   DROP TABLE public.small_station;
       public         heap    superdangerbro    false            -           1259    19183    typeorm_metadata    TABLE     �   CREATE TABLE public.typeorm_metadata (
    type character varying NOT NULL,
    schema character varying,
    name character varying,
    value text
);
 $   DROP TABLE public.typeorm_metadata;
       public         heap    superdangerbro    false            *           1259    18831 
   user_roles    TABLE     "  CREATE TABLE public.user_roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
    DROP TABLE public.user_roles;
       public         heap    superdangerbro    false    6            !           1259    18365    users    TABLE     I  CREATE TABLE public.users (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(100) NOT NULL,
    email character varying NOT NULL,
    phone character varying(20) NOT NULL,
    user_role uuid NOT NULL,
    is_contact boolean NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    password_digest character varying(255) NOT NULL
);
    DROP TABLE public.users;
       public         heap    superdangerbro    false    6            .           1259    19264    users_accounts_join    TABLE       CREATE TABLE public.users_accounts_join (
    user_id uuid NOT NULL,
    account_id uuid NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 '   DROP TABLE public.users_accounts_join;
       public         heap    superdangerbro    false            �           2604    19152    migrations id    DEFAULT     n   ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);
 <   ALTER TABLE public.migrations ALTER COLUMN id DROP DEFAULT;
       public          superdangerbro    false    300    299    300                      0    19333    account_billing_address 
   TABLE DATA           �   COPY public.account_billing_address (address_id, account_id, address1, address2, city, province, "postalCode", country, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    305   ��       �          0    18302    accounts 
   TABLE DATA           `   COPY public.accounts (account_id, name, is_company, created_at, updated_at, status) FROM stdin;
    public          superdangerbro    false    287   A�                 0    19307    accounts_contacts_join 
   TABLE DATA           f   COPY public.accounts_contacts_join (account_id, contact_id, role, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    304   t�       
          0    19746 	   addresses 
   TABLE DATA           �   COPY public.addresses (address_id, address1, address2, city, province, postal_code, country, label, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    307   ��       �          0    18162    ar_internal_metadata 
   TABLE DATA           R   COPY public.ar_internal_metadata (key, value, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    286   ��       �          0    18502    beaver_trap_types 
   TABLE DATA           R   COPY public.beaver_trap_types (beaver_trap_type_id, beaver_trap_type) FROM stdin;
    public          superdangerbro    false    294   ��       �          0    18492    beaver_traps 
   TABLE DATA           H   COPY public.beaver_traps (beaver_trap_id, beaver_trap_type) FROM stdin;
    public          superdangerbro    false    293   �       �          0    18375    contacts 
   TABLE DATA           7   COPY public.contacts (contact_id, user_id) FROM stdin;
    public          superdangerbro    false    290   7�       �          0    18563    equipment_inspections 
   TABLE DATA           �   COPY public.equipment_inspections (inspection_id, equipment_id, inspected_by, barcode, notes, image_url, created_at, updated_at, status) FROM stdin;
    public          superdangerbro    false    296   T�                  0    18583    equipment_statuses 
   TABLE DATA           ?   COPY public.equipment_statuses (status_id, status) FROM stdin;
    public          superdangerbro    false    297   ��                 0    19801    field_equipment 
   TABLE DATA           �   COPY public.field_equipment (equipment_id, job_id, equipment_type_id, location, is_georeferenced, status, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    309   ��                 0    19773    jobs 
   TABLE DATA           g   COPY public.jobs (job_id, job_type_id, property_id, status, notes, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    308   �       �          0    18482    large_stations 
   TABLE DATA           J   COPY public.large_stations (large_station_id, target_species) FROM stdin;
    public          superdangerbro    false    292   ��                 0    19149 
   migrations 
   TABLE DATA           ;   COPY public.migrations (id, "timestamp", name) FROM stdin;
    public          superdangerbro    false    300   ��       �          0    18323 
   properties 
   TABLE DATA           �   COPY public.properties (property_id, updated_at, created_at, name, location, boundary, status, type, address1, address2, city, province, postal_code, country, billing_address_id) FROM stdin;
    public          superdangerbro    false    288   *�                 0    19290    properties_accounts_join 
   TABLE DATA           i   COPY public.properties_accounts_join (property_id, account_id, role, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    303   ��       	          0    19350    property_billing_address 
   TABLE DATA           �   COPY public.property_billing_address (address_id, property_id, use_account_billing, account_id, address1, address2, city, province, "postalCode", country, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    306   }�       �          0    18517    rodent_species 
   TABLE DATA           P   COPY public.rodent_species (rodent_species_id, rodent_species_name) FROM stdin;
    public          superdangerbro    false    295   ��       �          0    18155    schema_migrations 
   TABLE DATA           4   COPY public.schema_migrations (version) FROM stdin;
    public          superdangerbro    false    285   ��                 0    19823    settings 
   TABLE DATA           J   COPY public.settings (id, key, value, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    310   ��       �          0    18472    small_station 
   TABLE DATA           I   COPY public.small_station (small_station_id, target_species) FROM stdin;
    public          superdangerbro    false    291   ��       �          0    16788    spatial_ref_sys 
   TABLE DATA           X   COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
    public          rdsadmin    false    224   �                 0    19183    typeorm_metadata 
   TABLE DATA           E   COPY public.typeorm_metadata (type, schema, name, value) FROM stdin;
    public          superdangerbro    false    301   2�                 0    18831 
   user_roles 
   TABLE DATA           F   COPY public.user_roles (id, name, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    298   �       �          0    18365    users 
   TABLE DATA           �   COPY public.users (user_id, username, email, phone, user_role, is_contact, updated_at, created_at, first_name, last_name, password_digest) FROM stdin;
    public          superdangerbro    false    289   ��                 0    19264    users_accounts_join 
   TABLE DATA           `   COPY public.users_accounts_join (user_id, account_id, role, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    302   ��       �          0    17751    geocode_settings 
   TABLE DATA           T   COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
    tiger          rds_superuser    false    235   ��       �          0    18085    pagc_gaz 
   TABLE DATA           K   COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
    tiger          rds_superuser    false    280   �       �          0    18095    pagc_lex 
   TABLE DATA           K   COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
    tiger          rds_superuser    false    282   -�       �          0    18105 
   pagc_rules 
   TABLE DATA           8   COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
    tiger          rds_superuser    false    284   J�       �          0    17551    topology 
   TABLE DATA           G   COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
    topology          rdsadmin    false    229   g�       �          0    17563    layer 
   TABLE DATA           �   COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
    topology          rdsadmin    false    230   ��                  0    0    migrations_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.migrations_id_seq', 32, true);
          public          superdangerbro    false    299                       0    0    topology_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('topology.topology_id_seq', 1, false);
          topology          rdsadmin    false    228                       2606    19156 )   migrations PK_8c82d7f526340ab734260ea46be 
   CONSTRAINT     i   ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);
 U   ALTER TABLE ONLY public.migrations DROP CONSTRAINT "PK_8c82d7f526340ab734260ea46be";
       public            superdangerbro    false    300            +           2606    19344 >   account_billing_address account_billing_address_account_id_key 
   CONSTRAINT        ALTER TABLE ONLY public.account_billing_address
    ADD CONSTRAINT account_billing_address_account_id_key UNIQUE (account_id);
 h   ALTER TABLE ONLY public.account_billing_address DROP CONSTRAINT account_billing_address_account_id_key;
       public            superdangerbro    false    305            -           2606    19342 4   account_billing_address account_billing_address_pkey 
   CONSTRAINT     z   ALTER TABLE ONLY public.account_billing_address
    ADD CONSTRAINT account_billing_address_pkey PRIMARY KEY (address_id);
 ^   ALTER TABLE ONLY public.account_billing_address DROP CONSTRAINT account_billing_address_pkey;
       public            superdangerbro    false    305            '           2606    19313 2   accounts_contacts_join accounts_contacts_join_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.accounts_contacts_join
    ADD CONSTRAINT accounts_contacts_join_pkey PRIMARY KEY (account_id, contact_id);
 \   ALTER TABLE ONLY public.accounts_contacts_join DROP CONSTRAINT accounts_contacts_join_pkey;
       public            superdangerbro    false    304    304            6           2606    19755    addresses addresses_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (address_id);
 B   ALTER TABLE ONLY public.addresses DROP CONSTRAINT addresses_pkey;
       public            superdangerbro    false    307            �           2606    18168 .   ar_internal_metadata ar_internal_metadata_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);
 X   ALTER TABLE ONLY public.ar_internal_metadata DROP CONSTRAINT ar_internal_metadata_pkey;
       public            superdangerbro    false    286            >           2606    19812 $   field_equipment field_equipment_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.field_equipment
    ADD CONSTRAINT field_equipment_pkey PRIMARY KEY (equipment_id);
 N   ALTER TABLE ONLY public.field_equipment DROP CONSTRAINT field_equipment_pkey;
       public            superdangerbro    false    309            <           2606    19784    jobs jobs_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (job_id);
 8   ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_pkey;
       public            superdangerbro    false    308            �           2606    18311    accounts pk_accounts 
   CONSTRAINT     Z   ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT pk_accounts PRIMARY KEY (account_id);
 >   ALTER TABLE ONLY public.accounts DROP CONSTRAINT pk_accounts;
       public            superdangerbro    false    287                       2606    18509 &   beaver_trap_types pk_beaver trap types 
   CONSTRAINT     w   ALTER TABLE ONLY public.beaver_trap_types
    ADD CONSTRAINT "pk_beaver trap types" PRIMARY KEY (beaver_trap_type_id);
 R   ALTER TABLE ONLY public.beaver_trap_types DROP CONSTRAINT "pk_beaver trap types";
       public            superdangerbro    false    294                       2606    18496    beaver_traps pk_beaver_traps 
   CONSTRAINT     f   ALTER TABLE ONLY public.beaver_traps
    ADD CONSTRAINT pk_beaver_traps PRIMARY KEY (beaver_trap_id);
 F   ALTER TABLE ONLY public.beaver_traps DROP CONSTRAINT pk_beaver_traps;
       public            superdangerbro    false    293            	           2606    18380    contacts pk_contacts 
   CONSTRAINT     Z   ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT pk_contacts PRIMARY KEY (contact_id);
 >   ALTER TABLE ONLY public.contacts DROP CONSTRAINT pk_contacts;
       public            superdangerbro    false    290                       2606    18572 .   equipment_inspections pk_equipment_inspections 
   CONSTRAINT     w   ALTER TABLE ONLY public.equipment_inspections
    ADD CONSTRAINT pk_equipment_inspections PRIMARY KEY (inspection_id);
 X   ALTER TABLE ONLY public.equipment_inspections DROP CONSTRAINT pk_equipment_inspections;
       public            superdangerbro    false    296                       2606    18589 (   equipment_statuses pk_equipment_statuses 
   CONSTRAINT     m   ALTER TABLE ONLY public.equipment_statuses
    ADD CONSTRAINT pk_equipment_statuses PRIMARY KEY (status_id);
 R   ALTER TABLE ONLY public.equipment_statuses DROP CONSTRAINT pk_equipment_statuses;
       public            superdangerbro    false    297                       2606    18486     large_stations pk_large_stations 
   CONSTRAINT     l   ALTER TABLE ONLY public.large_stations
    ADD CONSTRAINT pk_large_stations PRIMARY KEY (large_station_id);
 J   ALTER TABLE ONLY public.large_stations DROP CONSTRAINT pk_large_stations;
       public            superdangerbro    false    292                       2606    18328    properties pk_properties 
   CONSTRAINT     _   ALTER TABLE ONLY public.properties
    ADD CONSTRAINT pk_properties PRIMARY KEY (property_id);
 B   ALTER TABLE ONLY public.properties DROP CONSTRAINT pk_properties;
       public            superdangerbro    false    288                       2606    18522     rodent_species pk_rodent_species 
   CONSTRAINT     m   ALTER TABLE ONLY public.rodent_species
    ADD CONSTRAINT pk_rodent_species PRIMARY KEY (rodent_species_id);
 J   ALTER TABLE ONLY public.rodent_species DROP CONSTRAINT pk_rodent_species;
       public            superdangerbro    false    295                       2606    18476    small_station pk_small_station 
   CONSTRAINT     j   ALTER TABLE ONLY public.small_station
    ADD CONSTRAINT pk_small_station PRIMARY KEY (small_station_id);
 H   ALTER TABLE ONLY public.small_station DROP CONSTRAINT pk_small_station;
       public            superdangerbro    false    291                       2606    18372    users pk_users 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT pk_users PRIMARY KEY (user_id);
 8   ALTER TABLE ONLY public.users DROP CONSTRAINT pk_users;
       public            superdangerbro    false    289            %           2606    19296 6   properties_accounts_join properties_accounts_join_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.properties_accounts_join
    ADD CONSTRAINT properties_accounts_join_pkey PRIMARY KEY (property_id, account_id);
 `   ALTER TABLE ONLY public.properties_accounts_join DROP CONSTRAINT properties_accounts_join_pkey;
       public            superdangerbro    false    303    303            2           2606    19361 6   property_billing_address property_billing_address_pkey 
   CONSTRAINT     |   ALTER TABLE ONLY public.property_billing_address
    ADD CONSTRAINT property_billing_address_pkey PRIMARY KEY (address_id);
 `   ALTER TABLE ONLY public.property_billing_address DROP CONSTRAINT property_billing_address_pkey;
       public            superdangerbro    false    306            4           2606    19363 A   property_billing_address property_billing_address_property_id_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.property_billing_address
    ADD CONSTRAINT property_billing_address_property_id_key UNIQUE (property_id);
 k   ALTER TABLE ONLY public.property_billing_address DROP CONSTRAINT property_billing_address_property_id_key;
       public            superdangerbro    false    306            �           2606    18161 (   schema_migrations schema_migrations_pkey 
   CONSTRAINT     k   ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);
 R   ALTER TABLE ONLY public.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
       public            superdangerbro    false    285            @           2606    19834    settings settings_key_key 
   CONSTRAINT     S   ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);
 C   ALTER TABLE ONLY public.settings DROP CONSTRAINT settings_key_key;
       public            superdangerbro    false    310            B           2606    19832    settings settings_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.settings DROP CONSTRAINT settings_pkey;
       public            superdangerbro    false    310                       2606    18374    users unq_users_user_id 
   CONSTRAINT     \   ALTER TABLE ONLY public.users
    ADD CONSTRAINT unq_users_user_id UNIQUE (user_id, email);
 A   ALTER TABLE ONLY public.users DROP CONSTRAINT unq_users_user_id;
       public            superdangerbro    false    289    289                       2606    18840    user_roles user_roles_name_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_name_key UNIQUE (name);
 H   ALTER TABLE ONLY public.user_roles DROP CONSTRAINT user_roles_name_key;
       public            superdangerbro    false    298                       2606    18838    user_roles user_roles_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.user_roles DROP CONSTRAINT user_roles_pkey;
       public            superdangerbro    false    298            !           2606    19270 ,   users_accounts_join users_accounts_join_pkey 
   CONSTRAINT     {   ALTER TABLE ONLY public.users_accounts_join
    ADD CONSTRAINT users_accounts_join_pkey PRIMARY KEY (user_id, account_id);
 V   ALTER TABLE ONLY public.users_accounts_join DROP CONSTRAINT users_accounts_join_pkey;
       public            superdangerbro    false    302    302            .           1259    19377 #   idx_account_billing_address_account    INDEX     m   CREATE INDEX idx_account_billing_address_account ON public.account_billing_address USING btree (account_id);
 7   DROP INDEX public.idx_account_billing_address_account;
       public            superdangerbro    false    305            (           1259    19327 "   idx_accounts_contacts_join_account    INDEX     k   CREATE INDEX idx_accounts_contacts_join_account ON public.accounts_contacts_join USING btree (account_id);
 6   DROP INDEX public.idx_accounts_contacts_join_account;
       public            superdangerbro    false    304            )           1259    19328 "   idx_accounts_contacts_join_contact    INDEX     k   CREATE INDEX idx_accounts_contacts_join_contact ON public.accounts_contacts_join USING btree (contact_id);
 6   DROP INDEX public.idx_accounts_contacts_join_contact;
       public            superdangerbro    false    304            �           1259    19376    idx_accounts_status    INDEX     J   CREATE INDEX idx_accounts_status ON public.accounts USING btree (status);
 '   DROP INDEX public.idx_accounts_status;
       public            superdangerbro    false    287            7           1259    19798    idx_jobs_created_at    INDEX     O   CREATE INDEX idx_jobs_created_at ON public.jobs USING btree (created_at DESC);
 '   DROP INDEX public.idx_jobs_created_at;
       public            superdangerbro    false    308            8           1259    19836    idx_jobs_job_type    INDEX     I   CREATE INDEX idx_jobs_job_type ON public.jobs USING btree (job_type_id);
 %   DROP INDEX public.idx_jobs_job_type;
       public            superdangerbro    false    308            9           1259    19796    idx_jobs_property    INDEX     I   CREATE INDEX idx_jobs_property ON public.jobs USING btree (property_id);
 %   DROP INDEX public.idx_jobs_property;
       public            superdangerbro    false    308            :           1259    19797    idx_jobs_status    INDEX     B   CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);
 #   DROP INDEX public.idx_jobs_status;
       public            superdangerbro    false    308            "           1259    19326 $   idx_properties_accounts_join_account    INDEX     o   CREATE INDEX idx_properties_accounts_join_account ON public.properties_accounts_join USING btree (account_id);
 8   DROP INDEX public.idx_properties_accounts_join_account;
       public            superdangerbro    false    303            #           1259    19325 %   idx_properties_accounts_join_property    INDEX     q   CREATE INDEX idx_properties_accounts_join_property ON public.properties_accounts_join USING btree (property_id);
 9   DROP INDEX public.idx_properties_accounts_join_property;
       public            superdangerbro    false    303            �           1259    19761    idx_properties_billing_address    INDEX     c   CREATE INDEX idx_properties_billing_address ON public.properties USING btree (billing_address_id);
 2   DROP INDEX public.idx_properties_billing_address;
       public            superdangerbro    false    288            �           1259    19282    idx_properties_boundary    INDEX     Q   CREATE INDEX idx_properties_boundary ON public.properties USING gist (boundary);
 +   DROP INDEX public.idx_properties_boundary;
       public            superdangerbro    false    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    288                        1259    19281    idx_properties_location    INDEX     Q   CREATE INDEX idx_properties_location ON public.properties USING gist (location);
 +   DROP INDEX public.idx_properties_location;
       public            superdangerbro    false    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    288                       1259    19324    idx_properties_status    INDEX     N   CREATE INDEX idx_properties_status ON public.properties USING btree (status);
 )   DROP INDEX public.idx_properties_status;
       public            superdangerbro    false    288            /           1259    19379 $   idx_property_billing_address_account    INDEX     o   CREATE INDEX idx_property_billing_address_account ON public.property_billing_address USING btree (account_id);
 8   DROP INDEX public.idx_property_billing_address_account;
       public            superdangerbro    false    306            0           1259    19378 %   idx_property_billing_address_property    INDEX     q   CREATE INDEX idx_property_billing_address_property ON public.property_billing_address USING btree (property_id);
 9   DROP INDEX public.idx_property_billing_address_property;
       public            superdangerbro    false    306                       1259    19286    idx_users_accounts_join_account    INDEX     e   CREATE INDEX idx_users_accounts_join_account ON public.users_accounts_join USING btree (account_id);
 3   DROP INDEX public.idx_users_accounts_join_account;
       public            superdangerbro    false    302                       1259    19285    idx_users_accounts_join_user    INDEX     _   CREATE INDEX idx_users_accounts_join_user ON public.users_accounts_join USING btree (user_id);
 0   DROP INDEX public.idx_users_accounts_join_user;
       public            superdangerbro    false    302            _           2620    19800    jobs jobs_updated_at    TRIGGER     {   CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_jobs_updated_at();
 -   DROP TRIGGER jobs_updated_at ON public.jobs;
       public          superdangerbro    false    308    472            \           2620    19374 A   account_billing_address update_account_billing_address_updated_at    TRIGGER     �   CREATE TRIGGER update_account_billing_address_updated_at BEFORE UPDATE ON public.account_billing_address FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 Z   DROP TRIGGER update_account_billing_address_updated_at ON public.account_billing_address;
       public          superdangerbro    false    305    955            [           2620    19330 ?   accounts_contacts_join update_accounts_contacts_join_updated_at    TRIGGER     �   CREATE TRIGGER update_accounts_contacts_join_updated_at BEFORE UPDATE ON public.accounts_contacts_join FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 X   DROP TRIGGER update_accounts_contacts_join_updated_at ON public.accounts_contacts_join;
       public          superdangerbro    false    304    955            U           2620    18689 #   accounts update_accounts_updated_at    TRIGGER     �   CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 <   DROP TRIGGER update_accounts_updated_at ON public.accounts;
       public          superdangerbro    false    955    287            ^           2620    19762 %   addresses update_addresses_updated_at    TRIGGER     �   CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 >   DROP TRIGGER update_addresses_updated_at ON public.addresses;
       public          superdangerbro    false    307    955            X           2620    18641 =   equipment_inspections update_equipment_inspections_updated_at    TRIGGER     �   CREATE TRIGGER update_equipment_inspections_updated_at BEFORE UPDATE ON public.equipment_inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 V   DROP TRIGGER update_equipment_inspections_updated_at ON public.equipment_inspections;
       public          superdangerbro    false    296    955            Z           2620    19329 C   properties_accounts_join update_properties_accounts_join_updated_at    TRIGGER     �   CREATE TRIGGER update_properties_accounts_join_updated_at BEFORE UPDATE ON public.properties_accounts_join FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 \   DROP TRIGGER update_properties_accounts_join_updated_at ON public.properties_accounts_join;
       public          superdangerbro    false    955    303            V           2620    18673 '   properties update_properties_updated_at    TRIGGER     �   CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 @   DROP TRIGGER update_properties_updated_at ON public.properties;
       public          superdangerbro    false    955    288            ]           2620    19375 C   property_billing_address update_property_billing_address_updated_at    TRIGGER     �   CREATE TRIGGER update_property_billing_address_updated_at BEFORE UPDATE ON public.property_billing_address FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 \   DROP TRIGGER update_property_billing_address_updated_at ON public.property_billing_address;
       public          superdangerbro    false    306    955            Y           2620    19288 9   users_accounts_join update_users_accounts_join_updated_at    TRIGGER     �   CREATE TRIGGER update_users_accounts_join_updated_at BEFORE UPDATE ON public.users_accounts_join FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 R   DROP TRIGGER update_users_accounts_join_updated_at ON public.users_accounts_join;
       public          superdangerbro    false    302    955            W           2620    18705    users update_users_updated_at    TRIGGER     �   CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 6   DROP TRIGGER update_users_updated_at ON public.users;
       public          superdangerbro    false    289    955            P           2606    19345 ?   account_billing_address account_billing_address_account_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.account_billing_address
    ADD CONSTRAINT account_billing_address_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id) ON DELETE CASCADE;
 i   ALTER TABLE ONLY public.account_billing_address DROP CONSTRAINT account_billing_address_account_id_fkey;
       public          superdangerbro    false    5629    305    287            N           2606    19314 =   accounts_contacts_join accounts_contacts_join_account_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.accounts_contacts_join
    ADD CONSTRAINT accounts_contacts_join_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id) ON DELETE CASCADE;
 g   ALTER TABLE ONLY public.accounts_contacts_join DROP CONSTRAINT accounts_contacts_join_account_id_fkey;
       public          superdangerbro    false    287    5629    304            O           2606    19319 =   accounts_contacts_join accounts_contacts_join_contact_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.accounts_contacts_join
    ADD CONSTRAINT accounts_contacts_join_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(contact_id) ON DELETE CASCADE;
 g   ALTER TABLE ONLY public.accounts_contacts_join DROP CONSTRAINT accounts_contacts_join_contact_id_fkey;
       public          superdangerbro    false    5641    304    290            T           2606    19813 +   field_equipment field_equipment_job_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.field_equipment
    ADD CONSTRAINT field_equipment_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(job_id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.field_equipment DROP CONSTRAINT field_equipment_job_id_fkey;
       public          superdangerbro    false    309    308    5692            I           2606    18510     beaver_traps fk_beaver_trap_type    FK CONSTRAINT     �   ALTER TABLE ONLY public.beaver_traps
    ADD CONSTRAINT fk_beaver_trap_type FOREIGN KEY (beaver_trap_type) REFERENCES public.beaver_trap_types(beaver_trap_type_id) ON UPDATE CASCADE ON DELETE SET NULL;
 J   ALTER TABLE ONLY public.beaver_traps DROP CONSTRAINT fk_beaver_trap_type;
       public          superdangerbro    false    293    294    5649            F           2606    18381    contacts fk_contacts_users    FK CONSTRAINT     ~   ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT fk_contacts_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);
 D   ALTER TABLE ONLY public.contacts DROP CONSTRAINT fk_contacts_users;
       public          superdangerbro    false    289    5637    290            S           2606    19790    jobs fk_jobs_property    FK CONSTRAINT     �   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT fk_jobs_property FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON UPDATE CASCADE ON DELETE RESTRICT;
 ?   ALTER TABLE ONLY public.jobs DROP CONSTRAINT fk_jobs_property;
       public          superdangerbro    false    288    5635    308            H           2606    18528 '   large_stations fk_large_stations_target    FK CONSTRAINT     �   ALTER TABLE ONLY public.large_stations
    ADD CONSTRAINT fk_large_stations_target FOREIGN KEY (target_species) REFERENCES public.rodent_species(rodent_species_id);
 Q   ALTER TABLE ONLY public.large_stations DROP CONSTRAINT fk_large_stations_target;
       public          superdangerbro    false    5651    292    295            C           2606    19756 (   properties fk_properties_billing_address    FK CONSTRAINT     �   ALTER TABLE ONLY public.properties
    ADD CONSTRAINT fk_properties_billing_address FOREIGN KEY (billing_address_id) REFERENCES public.addresses(address_id) ON DELETE SET NULL;
 R   ALTER TABLE ONLY public.properties DROP CONSTRAINT fk_properties_billing_address;
       public          superdangerbro    false    307    288    5686            G           2606    18523 %   small_station fk_small_station_target    FK CONSTRAINT     �   ALTER TABLE ONLY public.small_station
    ADD CONSTRAINT fk_small_station_target FOREIGN KEY (target_species) REFERENCES public.rodent_species(rodent_species_id);
 O   ALTER TABLE ONLY public.small_station DROP CONSTRAINT fk_small_station_target;
       public          superdangerbro    false    295    291    5651            D           2606    18841    users fk_user_role    FK CONSTRAINT     x   ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_user_role FOREIGN KEY (user_role) REFERENCES public.user_roles(id);
 <   ALTER TABLE ONLY public.users DROP CONSTRAINT fk_user_role;
       public          superdangerbro    false    5659    298    289            E           2606    18861    users fk_users_user_roles    FK CONSTRAINT     �   ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_user_roles FOREIGN KEY (user_role) REFERENCES public.user_roles(id) ON UPDATE CASCADE ON DELETE SET NULL;
 C   ALTER TABLE ONLY public.users DROP CONSTRAINT fk_users_user_roles;
       public          superdangerbro    false    298    289    5659            L           2606    19302 A   properties_accounts_join properties_accounts_join_account_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.properties_accounts_join
    ADD CONSTRAINT properties_accounts_join_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id) ON DELETE CASCADE;
 k   ALTER TABLE ONLY public.properties_accounts_join DROP CONSTRAINT properties_accounts_join_account_id_fkey;
       public          superdangerbro    false    5629    287    303            M           2606    19297 B   properties_accounts_join properties_accounts_join_property_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.properties_accounts_join
    ADD CONSTRAINT properties_accounts_join_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;
 l   ALTER TABLE ONLY public.properties_accounts_join DROP CONSTRAINT properties_accounts_join_property_id_fkey;
       public          superdangerbro    false    288    5635    303            Q           2606    19369 A   property_billing_address property_billing_address_account_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.property_billing_address
    ADD CONSTRAINT property_billing_address_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id);
 k   ALTER TABLE ONLY public.property_billing_address DROP CONSTRAINT property_billing_address_account_id_fkey;
       public          superdangerbro    false    287    306    5629            R           2606    19364 B   property_billing_address property_billing_address_property_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.property_billing_address
    ADD CONSTRAINT property_billing_address_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;
 l   ALTER TABLE ONLY public.property_billing_address DROP CONSTRAINT property_billing_address_property_id_fkey;
       public          superdangerbro    false    306    288    5635            J           2606    19276 7   users_accounts_join users_accounts_join_account_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.users_accounts_join
    ADD CONSTRAINT users_accounts_join_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id) ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.users_accounts_join DROP CONSTRAINT users_accounts_join_account_id_fkey;
       public          superdangerbro    false    302    287    5629            K           2606    19271 4   users_accounts_join users_accounts_join_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.users_accounts_join
    ADD CONSTRAINT users_accounts_join_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.users_accounts_join DROP CONSTRAINT users_accounts_join_user_id_fkey;
       public          superdangerbro    false    302    5637    289               =  x�}бNc1����)ܯ&���c;Ф�]�(���D�^���jˀ��t���X��2AZ���j�8t��sˍ�&�TA�^�hSGB������������^���r��׋����ɇ��=�P00B�iϴ����%�_�?�K�X�F�A7�5��'�l����]�����f &6P�!�͆%V��Z��t}��F����0������î����䏗c�F�>�=�.����ȿ��Tj�v��֭q)S![ ��֭;l363�yK�<3pbT)�'m�Q�����'\_�݇�p�>С~QO����JD�Q�./�eY�̈́J      �   #  x�}��J�0���S��L2�I��xѳ�L�Vv[a��ooЂa���|SM�}J^���	
��������t[g�2K���Hta4佷�����Yz�*��T�,p��$�N����ҽ��6<�ޖ���2 G�H8��I|�Bu\M��� �hA��:;D�}�>��]���~@�D�Q,�{hN���NRm��(�~��&4��=�.���e=߶Ӻ\��%K�`mt."�-��t�bL�R)��
,nnb���Q%�\w[+=e=_��0�i�1���������o@h��            x������ � �      
      x������ � �      �   ?   x�K�+�,���M�+�LI-K��/ ���Ltt�̭LL���L�L���Hq��qqq �xZ      �      x������ � �      �      x������ � �      �      x������ � �      �   p  x���I�1E�Y��"�Q��C��QJ!�k���h���P��XBB��x|*�F������0��Yk��VuH
�7E��X�cڠ��>�^�F,�=�_��@\�1]%����?HZ�?�ʋv�Q��v�Ed
�R��Nƣ#��l]|��9+=�N��5%�`-���:C�L��p�2�ڌ
\�������������1����>k��4[�{�b�Gя�|���z^���:�]AC(�X��<�r
:�?}KX�L�j����W�cvБh����Y��t4����FM5թА�6�|f���rK�#�Ry�ܸCb��2(u]MV&�Lbͯl����^���l�;�F'��~�\~�E��             x������ � �            x������ � �         y   x�}�1�0 �9yEw��Im����8��XJ%����z�#���"��v���^�`	w��QgW2PQ��P-P3ք�/���c<�G�n!�/B��ʴ�Υ0�tA��q�c�_/&
      �      x������ � �         f  x�m�MO�0���A���q�!�@�����F�4)m�6~=m�z͠��yd�u�U��Y���z�V�g��k�U ��̒�a�����i�����yD��[g��F������2#����'c/N۪ҽ2�V��V7�A},�"�G"S}S�����r>�k��� !-��s�n��B�-v�GAJ��:��<:���dn��9���e�!���^+�ߢ«S{�K��e�)��J� ��/Y����ݔ�W�p�pZr����ƒvES���(��W/����zy�<T��[�m�]Ü�x�����%���@�&Ǟ�nH���]��x�'�`[��=���t1�%������ ~�r�      �   h  x�͑AK�0���_�`��d2���M�xA��%�f��+���7nW�ON ��2�<�J��@������7��M(�m�QHڀF_!�jk��J8��kgkCk�-+� �yN�]���y�y>�n�ax|~ɓSV	��� ڶ�q�m����chbG]hH�J��xO��a�q�F^Z/�<�K��o�	q��/z�A;l".�'��-6d�_�U��%�)?��|��t����*�!�R��L��.�Az����~�E��8�,'6�۬Aj��޳�I���_̾��?�8�i�f��鮊������_V|�O�Y��BI��Ľ�!ꓓby�IN	���H�~��>��z�Z��         �   x���=R�0D���2��c9g�����OBCA��}o�a�Q����A_TAyTg�>��Ey��f� "n>�W���yno���U��P�ڡ|����؞�NY�������Щ+e���?�i�G��Zk־�����t���X(�qHuBN�a,��[�z��	C�UR�q-�E��Bz�/6�?\��R>9ua�      	      x������ � �      �      x������ � �      �   -   x�32021404707130�2B���pMa�FƆf&F@�1z\\\ �R�         �  x��T���0=�������b.���*U�K��6ZZ��6�V���ڬ�MX��j�=af�ͼ�'=<�U�p�X�yK,ӈb	@D,-h4���[��3�n�X�Q��vF	�8"�
Dx��Ds!�(I��z6�2)y�b��"�\�N��H"ey2�Cݷ������N�f(|�4�hهW(�jhJ�'%k�h�p>��>f������m��^ku萫��������G{
JWf� �+���fhl�Q�N'�J5 ���R��ޜ����Acc��AOzT�1�Bf����=n;n��Νl��������	!���H�tU�\���t_�!������{��q{��'�w��V�[����Y��\Vc%�Ѝ\a��%ZJ[��J��v{��"�/k0e�*�'��_��i.����ι!�,N���4��ԏ�� &��X㲠)�i.�H�+��B�rUtbGƝ}�n�A��3������\j��9�8#"���3gmS:ϲ��yS���      �      x������ � �      �      x������ � �         �   x�m��j1���)�J�E�՛xX\-]{d�m`�Y�X�Oo�]�PsK�?�}SW��rWm7������c���WO�i����m^����tƄ��l'}���ǎ��a�H�Z�>8�6x@K�-�5�F�]qf�8U�H�	�:ҿ���b�&Me�A�O'Sk����A+1}ǁK�:�i�#f>`��c����PVMf96�Ľ�6�7�x�VJ� `�x�         �   x��ͽ1@�:��|rl�q�c J:�Q@�K0��Oz_S�U��*N ������c����xBHD'�uO�����I1W�d}�e� ��+���ݒ��.���|$�s�eS�Gt�Z�ay�>$��-\?���-����B�      �      x������ � �            x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �     