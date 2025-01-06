PGDMP  "    &                 }            field_hive_development    16.3    16.4 p    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16411    field_hive_development    DATABASE     �   CREATE DATABASE field_hive_development WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';
 &   DROP DATABASE field_hive_development;
                superdangerbro    false            �           0    0    field_hive_development    DATABASE PROPERTIES     a   ALTER DATABASE field_hive_development SET search_path TO '$user', 'public', 'topology', 'tiger';
                     superdangerbro    false                        2615    17744    tiger    SCHEMA        CREATE SCHEMA tiger;
    DROP SCHEMA tiger;
                rdsadmin    false                        3079    17720    fuzzystrmatch 	   EXTENSION     A   CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;
    DROP EXTENSION fuzzystrmatch;
                   false            �           0    0    EXTENSION fuzzystrmatch    COMMENT     ]   COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';
                        false    4                        3079    16470    postgis 	   EXTENSION     ;   CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
    DROP EXTENSION postgis;
                   false            �           0    0    EXTENSION postgis    COMMENT     ^   COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';
                        false    2                        3079    17745    postgis_tiger_geocoder 	   EXTENSION     I   CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;
 '   DROP EXTENSION postgis_tiger_geocoder;
                   false    4    12    2            �           0    0     EXTENSION postgis_tiger_geocoder    COMMENT     ^   COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';
                        false    5                        2615    17548    topology    SCHEMA        CREATE SCHEMA topology;
    DROP SCHEMA topology;
                rdsadmin    false            �           0    0    SCHEMA topology    COMMENT     9   COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';
                   rdsadmin    false    11                        3079    17549    postgis_topology 	   EXTENSION     F   CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;
 !   DROP EXTENSION postgis_topology;
                   false    11    2            �           0    0    EXTENSION postgis_topology    COMMENT     Y   COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';
                        false    3                        3079    18291 	   uuid-ossp 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
    DROP EXTENSION "uuid-ossp";
                   false            �           0    0    EXTENSION "uuid-ossp"    COMMENT     W   COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';
                        false    6                       1247    19160    equipment_status_enum    TYPE     q   CREATE TYPE public.equipment_status_enum AS ENUM (
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
       public          superdangerbro    false                       1259    18302    accounts    TABLE     t  CREATE TABLE public.accounts (
    account_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    status text DEFAULT 'active'::character varying,
    billing_address_id uuid,
    type text NOT NULL
);
    DROP TABLE public.accounts;
       public         heap    superdangerbro    false    6            '           1259    20134 	   addresses    TABLE       CREATE TABLE public.addresses (
    address_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    address1 character varying NOT NULL,
    address2 character varying,
    city character varying NOT NULL,
    province character varying NOT NULL,
    postal_code character varying NOT NULL,
    country character varying DEFAULT 'Canada'::character varying NOT NULL,
    label character varying,
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
       public         heap    superdangerbro    false            "           1259    18563    equipment_inspections    TABLE     �  CREATE TABLE public.equipment_inspections (
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
       public         heap    superdangerbro    false    2064            )           1259    20174    field_equipment    TABLE       CREATE TABLE public.field_equipment (
    equipment_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid NOT NULL,
    equipment_type_id text NOT NULL,
    location public.geometry(Point,4326),
    is_georeferenced boolean DEFAULT true,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    barcode character varying(255),
    photo_url character varying(255),
    data jsonb
);
 #   DROP TABLE public.field_equipment;
       public         heap    superdangerbro    false    6    2    2    2    2    2    2    2    2            *           1259    20192    field_inspections    TABLE     �  CREATE TABLE public.field_inspections (
    inspection_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    equipment_id uuid NOT NULL,
    inspected_by uuid NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    barcode character varying,
    notes character varying,
    image_url text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 %   DROP TABLE public.field_inspections;
       public         heap    superdangerbro    false    6            (           1259    20157    jobs    TABLE       CREATE TABLE public.jobs (
    job_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_id uuid NOT NULL,
    job_type_id text NOT NULL,
    status text DEFAULT 'pending'::character varying NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    title text,
    use_custom_addresses boolean DEFAULT false NOT NULL,
    service_address_id uuid,
    billing_address_id uuid
);
    DROP TABLE public.jobs;
       public         heap    superdangerbro    false    6            $           1259    19149 
   migrations    TABLE     �   CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);
    DROP TABLE public.migrations;
       public         heap    superdangerbro    false            #           1259    19148    migrations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.migrations_id_seq;
       public          superdangerbro    false    292            �           0    0    migrations_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;
          public          superdangerbro    false    291                        1259    18323 
   properties    TABLE     S  CREATE TABLE public.properties (
    property_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name character varying(255) NOT NULL,
    location public.geometry(Point,4326),
    boundary public.geometry(Polygon,4326),
    billing_address_id uuid,
    service_address_id uuid,
    status text DEFAULT 'pending'::character varying NOT NULL,
    property_type text DEFAULT 'residential'::text NOT NULL COLLATE pg_catalog."aa_DJ"
);
    DROP TABLE public.properties;
       public         heap    superdangerbro    false    6    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2            ,           1259    20236    properties_accounts    TABLE     �   CREATE TABLE public.properties_accounts (
    property_id uuid NOT NULL,
    account_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 '   DROP TABLE public.properties_accounts;
       public         heap    superdangerbro    false                       1259    18155    schema_migrations    TABLE     R   CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);
 %   DROP TABLE public.schema_migrations;
       public         heap    superdangerbro    false            &           1259    20124    settings    TABLE       CREATE TABLE public.settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    key character varying NOT NULL,
    value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.settings;
       public         heap    superdangerbro    false    6            %           1259    19183    typeorm_metadata    TABLE     �   CREATE TABLE public.typeorm_metadata (
    type character varying NOT NULL,
    schema character varying,
    name character varying,
    value text
);
 $   DROP TABLE public.typeorm_metadata;
       public         heap    superdangerbro    false            !           1259    18365    users    TABLE     ,  CREATE TABLE public.users (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(100) NOT NULL,
    email character varying NOT NULL,
    phone character varying(20) NOT NULL,
    is_contact boolean NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    password_digest character varying(255) NOT NULL
);
    DROP TABLE public.users;
       public         heap    superdangerbro    false    6            +           1259    20215    users_accounts    TABLE       CREATE TABLE public.users_accounts (
    user_id uuid NOT NULL,
    account_id uuid NOT NULL,
    role character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 "   DROP TABLE public.users_accounts;
       public         heap    superdangerbro    false            �           2604    19152    migrations id    DEFAULT     n   ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);
 <   ALTER TABLE public.migrations ALTER COLUMN id DROP DEFAULT;
       public          superdangerbro    false    292    291    292            �          0    18302    accounts 
   TABLE DATA           n   COPY public.accounts (account_id, name, created_at, updated_at, status, billing_address_id, type) FROM stdin;
    public          superdangerbro    false    287   O�       �          0    20134 	   addresses 
   TABLE DATA           �   COPY public.addresses (address_id, address1, address2, city, province, postal_code, country, label, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    295   3�       �          0    18162    ar_internal_metadata 
   TABLE DATA           R   COPY public.ar_internal_metadata (key, value, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    286   ��       �          0    18563    equipment_inspections 
   TABLE DATA           �   COPY public.equipment_inspections (inspection_id, equipment_id, inspected_by, barcode, notes, image_url, created_at, updated_at, status) FROM stdin;
    public          superdangerbro    false    290   �       �          0    20174    field_equipment 
   TABLE DATA           �   COPY public.field_equipment (equipment_id, job_id, equipment_type_id, location, is_georeferenced, status, created_at, updated_at, barcode, photo_url, data) FROM stdin;
    public          superdangerbro    false    297   u�       �          0    20192    field_inspections 
   TABLE DATA           �   COPY public.field_inspections (inspection_id, equipment_id, inspected_by, status, barcode, notes, image_url, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    298   9�       �          0    20157    jobs 
   TABLE DATA           �   COPY public.jobs (job_id, property_id, job_type_id, status, description, created_at, updated_at, title, use_custom_addresses, service_address_id, billing_address_id) FROM stdin;
    public          superdangerbro    false    296   V�       �          0    19149 
   migrations 
   TABLE DATA           ;   COPY public.migrations (id, "timestamp", name) FROM stdin;
    public          superdangerbro    false    292   ��       �          0    18323 
   properties 
   TABLE DATA           �   COPY public.properties (property_id, updated_at, created_at, name, location, boundary, billing_address_id, service_address_id, status, property_type) FROM stdin;
    public          superdangerbro    false    288   ��       �          0    20236    properties_accounts 
   TABLE DATA           ^   COPY public.properties_accounts (property_id, account_id, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    300   t�       �          0    18155    schema_migrations 
   TABLE DATA           4   COPY public.schema_migrations (version) FROM stdin;
    public          superdangerbro    false    285   8�       �          0    20124    settings 
   TABLE DATA           J   COPY public.settings (id, key, value, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    294   u�       x          0    16788    spatial_ref_sys 
   TABLE DATA           X   COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
    public          rdsadmin    false    224   Խ       �          0    19183    typeorm_metadata 
   TABLE DATA           E   COPY public.typeorm_metadata (type, schema, name, value) FROM stdin;
    public          superdangerbro    false    293   �       �          0    18365    users 
   TABLE DATA           �   COPY public.users (user_id, username, email, phone, is_contact, updated_at, created_at, first_name, last_name, password_digest) FROM stdin;
    public          superdangerbro    false    289   پ       �          0    20215    users_accounts 
   TABLE DATA           [   COPY public.users_accounts (user_id, account_id, role, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    299   ��       |          0    17751    geocode_settings 
   TABLE DATA           T   COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
    tiger          rds_superuser    false    235   �       }          0    18085    pagc_gaz 
   TABLE DATA           K   COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
    tiger          rds_superuser    false    280   0�       ~          0    18095    pagc_lex 
   TABLE DATA           K   COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
    tiger          rds_superuser    false    282   M�                 0    18105 
   pagc_rules 
   TABLE DATA           8   COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
    tiger          rds_superuser    false    284   j�       z          0    17551    topology 
   TABLE DATA           G   COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
    topology          rdsadmin    false    229   ��       {          0    17563    layer 
   TABLE DATA           �   COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
    topology          rdsadmin    false    230   ��       �           0    0    migrations_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.migrations_id_seq', 59, true);
          public          superdangerbro    false    291            �           0    0    topology_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('topology.topology_id_seq', 1, false);
          topology          rdsadmin    false    228            �           2606    19156 )   migrations PK_8c82d7f526340ab734260ea46be 
   CONSTRAINT     i   ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);
 U   ALTER TABLE ONLY public.migrations DROP CONSTRAINT "PK_8c82d7f526340ab734260ea46be";
       public            superdangerbro    false    292            �           2606    20144    addresses addresses_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (address_id);
 B   ALTER TABLE ONLY public.addresses DROP CONSTRAINT addresses_pkey;
       public            superdangerbro    false    295            �           2606    18168 .   ar_internal_metadata ar_internal_metadata_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);
 X   ALTER TABLE ONLY public.ar_internal_metadata DROP CONSTRAINT ar_internal_metadata_pkey;
       public            superdangerbro    false    286            �           2606    20185 $   field_equipment field_equipment_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.field_equipment
    ADD CONSTRAINT field_equipment_pkey PRIMARY KEY (equipment_id);
 N   ALTER TABLE ONLY public.field_equipment DROP CONSTRAINT field_equipment_pkey;
       public            superdangerbro    false    297            �           2606    20202 (   field_inspections field_inspections_pkey 
   CONSTRAINT     q   ALTER TABLE ONLY public.field_inspections
    ADD CONSTRAINT field_inspections_pkey PRIMARY KEY (inspection_id);
 R   ALTER TABLE ONLY public.field_inspections DROP CONSTRAINT field_inspections_pkey;
       public            superdangerbro    false    298            �           2606    20167    jobs jobs_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (job_id);
 8   ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_pkey;
       public            superdangerbro    false    296            �           2606    18311    accounts pk_accounts 
   CONSTRAINT     Z   ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT pk_accounts PRIMARY KEY (account_id);
 >   ALTER TABLE ONLY public.accounts DROP CONSTRAINT pk_accounts;
       public            superdangerbro    false    287            �           2606    18572 .   equipment_inspections pk_equipment_inspections 
   CONSTRAINT     w   ALTER TABLE ONLY public.equipment_inspections
    ADD CONSTRAINT pk_equipment_inspections PRIMARY KEY (inspection_id);
 X   ALTER TABLE ONLY public.equipment_inspections DROP CONSTRAINT pk_equipment_inspections;
       public            superdangerbro    false    290            �           2606    18328    properties pk_properties 
   CONSTRAINT     _   ALTER TABLE ONLY public.properties
    ADD CONSTRAINT pk_properties PRIMARY KEY (property_id);
 B   ALTER TABLE ONLY public.properties DROP CONSTRAINT pk_properties;
       public            superdangerbro    false    288            �           2606    18372    users pk_users 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT pk_users PRIMARY KEY (user_id);
 8   ALTER TABLE ONLY public.users DROP CONSTRAINT pk_users;
       public            superdangerbro    false    289            �           2606    20242 ,   properties_accounts properties_accounts_pkey 
   CONSTRAINT        ALTER TABLE ONLY public.properties_accounts
    ADD CONSTRAINT properties_accounts_pkey PRIMARY KEY (property_id, account_id);
 V   ALTER TABLE ONLY public.properties_accounts DROP CONSTRAINT properties_accounts_pkey;
       public            superdangerbro    false    300    300            �           2606    18161 (   schema_migrations schema_migrations_pkey 
   CONSTRAINT     k   ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);
 R   ALTER TABLE ONLY public.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
       public            superdangerbro    false    285            �           2606    20133    settings settings_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.settings DROP CONSTRAINT settings_pkey;
       public            superdangerbro    false    294            �           2606    18374    users unq_users_user_id 
   CONSTRAINT     \   ALTER TABLE ONLY public.users
    ADD CONSTRAINT unq_users_user_id UNIQUE (user_id, email);
 A   ALTER TABLE ONLY public.users DROP CONSTRAINT unq_users_user_id;
       public            superdangerbro    false    289    289            �           2606    20286    settings uq_settings_key 
   CONSTRAINT     R   ALTER TABLE ONLY public.settings
    ADD CONSTRAINT uq_settings_key UNIQUE (key);
 B   ALTER TABLE ONLY public.settings DROP CONSTRAINT uq_settings_key;
       public            superdangerbro    false    294            �           2606    20223 "   users_accounts users_accounts_pkey 
   CONSTRAINT     q   ALTER TABLE ONLY public.users_accounts
    ADD CONSTRAINT users_accounts_pkey PRIMARY KEY (user_id, account_id);
 L   ALTER TABLE ONLY public.users_accounts DROP CONSTRAINT users_accounts_pkey;
       public            superdangerbro    false    299    299            �           1259    20156    idx_accounts_billing_address    INDEX     _   CREATE INDEX idx_accounts_billing_address ON public.accounts USING btree (billing_address_id);
 0   DROP INDEX public.idx_accounts_billing_address;
       public            superdangerbro    false    287            �           1259    20290    idx_accounts_status    INDEX     J   CREATE INDEX idx_accounts_status ON public.accounts USING btree (status);
 '   DROP INDEX public.idx_accounts_status;
       public            superdangerbro    false    287            �           1259    20292    idx_field_equipment_barcode    INDEX     Z   CREATE INDEX idx_field_equipment_barcode ON public.field_equipment USING btree (barcode);
 /   DROP INDEX public.idx_field_equipment_barcode;
       public            superdangerbro    false    297            �           1259    20191    idx_field_equipment_job    INDEX     U   CREATE INDEX idx_field_equipment_job ON public.field_equipment USING btree (job_id);
 +   DROP INDEX public.idx_field_equipment_job;
       public            superdangerbro    false    297            �           1259    20213    idx_field_inspections_equipment    INDEX     e   CREATE INDEX idx_field_inspections_equipment ON public.field_inspections USING btree (equipment_id);
 3   DROP INDEX public.idx_field_inspections_equipment;
       public            superdangerbro    false    298            �           1259    20214    idx_field_inspections_inspector    INDEX     e   CREATE INDEX idx_field_inspections_inspector ON public.field_inspections USING btree (inspected_by);
 3   DROP INDEX public.idx_field_inspections_inspector;
       public            superdangerbro    false    298            �           1259    20173    idx_jobs_property    INDEX     I   CREATE INDEX idx_jobs_property ON public.jobs USING btree (property_id);
 %   DROP INDEX public.idx_jobs_property;
       public            superdangerbro    false    296            �           1259    20254    idx_properties_accounts_account    INDEX     e   CREATE INDEX idx_properties_accounts_account ON public.properties_accounts USING btree (account_id);
 3   DROP INDEX public.idx_properties_accounts_account;
       public            superdangerbro    false    300            �           1259    20253     idx_properties_accounts_property    INDEX     g   CREATE INDEX idx_properties_accounts_property ON public.properties_accounts USING btree (property_id);
 4   DROP INDEX public.idx_properties_accounts_property;
       public            superdangerbro    false    300            �           1259    19761    idx_properties_billing_address    INDEX     c   CREATE INDEX idx_properties_billing_address ON public.properties USING btree (billing_address_id);
 2   DROP INDEX public.idx_properties_billing_address;
       public            superdangerbro    false    288            �           1259    19282    idx_properties_boundary    INDEX     Q   CREATE INDEX idx_properties_boundary ON public.properties USING gist (boundary);
 +   DROP INDEX public.idx_properties_boundary;
       public            superdangerbro    false    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    288            �           1259    19281    idx_properties_location    INDEX     Q   CREATE INDEX idx_properties_location ON public.properties USING gist (location);
 +   DROP INDEX public.idx_properties_location;
       public            superdangerbro    false    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    288            �           1259    20155    idx_properties_service_address    INDEX     c   CREATE INDEX idx_properties_service_address ON public.properties USING btree (service_address_id);
 2   DROP INDEX public.idx_properties_service_address;
       public            superdangerbro    false    288            �           1259    20293    idx_properties_status    INDEX     N   CREATE INDEX idx_properties_status ON public.properties USING btree (status);
 )   DROP INDEX public.idx_properties_status;
       public            superdangerbro    false    288            �           1259    20294    idx_properties_type    INDEX     S   CREATE INDEX idx_properties_type ON public.properties USING btree (property_type);
 '   DROP INDEX public.idx_properties_type;
       public            superdangerbro    false    288            �           1259    20235    idx_users_accounts_account    INDEX     [   CREATE INDEX idx_users_accounts_account ON public.users_accounts USING btree (account_id);
 .   DROP INDEX public.idx_users_accounts_account;
       public            superdangerbro    false    299            �           1259    20234    idx_users_accounts_user    INDEX     U   CREATE INDEX idx_users_accounts_user ON public.users_accounts USING btree (user_id);
 +   DROP INDEX public.idx_users_accounts_user;
       public            superdangerbro    false    299                        2620    18689 #   accounts update_accounts_updated_at    TRIGGER     �   CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 <   DROP TRIGGER update_accounts_updated_at ON public.accounts;
       public          superdangerbro    false    287    945                       2620    18641 =   equipment_inspections update_equipment_inspections_updated_at    TRIGGER     �   CREATE TRIGGER update_equipment_inspections_updated_at BEFORE UPDATE ON public.equipment_inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 V   DROP TRIGGER update_equipment_inspections_updated_at ON public.equipment_inspections;
       public          superdangerbro    false    945    290                       2620    18673 '   properties update_properties_updated_at    TRIGGER     �   CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 @   DROP TRIGGER update_properties_updated_at ON public.properties;
       public          superdangerbro    false    288    945                       2620    18705    users update_users_updated_at    TRIGGER     �   CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 6   DROP TRIGGER update_users_updated_at ON public.users;
       public          superdangerbro    false    945    289            �           2606    20266    jobs FK_jobs_billing_address    FK CONSTRAINT     �   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "FK_jobs_billing_address" FOREIGN KEY (billing_address_id) REFERENCES public.addresses(address_id) ON DELETE SET NULL;
 H   ALTER TABLE ONLY public.jobs DROP CONSTRAINT "FK_jobs_billing_address";
       public          superdangerbro    false    295    5600    296            �           2606    20261    jobs FK_jobs_service_address    FK CONSTRAINT     �   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "FK_jobs_service_address" FOREIGN KEY (service_address_id) REFERENCES public.addresses(address_id) ON DELETE SET NULL;
 H   ALTER TABLE ONLY public.jobs DROP CONSTRAINT "FK_jobs_service_address";
       public          superdangerbro    false    295    5600    296            �           2606    20150 )   accounts accounts_billing_address_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_billing_address_id_fkey FOREIGN KEY (billing_address_id) REFERENCES public.addresses(address_id) ON DELETE SET NULL;
 S   ALTER TABLE ONLY public.accounts DROP CONSTRAINT accounts_billing_address_id_fkey;
       public          superdangerbro    false    287    295    5600            �           2606    20186 +   field_equipment field_equipment_job_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.field_equipment
    ADD CONSTRAINT field_equipment_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(job_id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.field_equipment DROP CONSTRAINT field_equipment_job_id_fkey;
       public          superdangerbro    false    296    5603    297            �           2606    20203 5   field_inspections field_inspections_equipment_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.field_inspections
    ADD CONSTRAINT field_inspections_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.field_equipment(equipment_id) ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.field_inspections DROP CONSTRAINT field_inspections_equipment_id_fkey;
       public          superdangerbro    false    297    5605    298            �           2606    20208 5   field_inspections field_inspections_inspected_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.field_inspections
    ADD CONSTRAINT field_inspections_inspected_by_fkey FOREIGN KEY (inspected_by) REFERENCES public.users(user_id) ON DELETE RESTRICT;
 _   ALTER TABLE ONLY public.field_inspections DROP CONSTRAINT field_inspections_inspected_by_fkey;
       public          superdangerbro    false    298    289    5588            �           2606    20168    jobs jobs_property_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_property_id_fkey;
       public          superdangerbro    false    288    296    5586            �           2606    20248 7   properties_accounts properties_accounts_account_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.properties_accounts
    ADD CONSTRAINT properties_accounts_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id) ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.properties_accounts DROP CONSTRAINT properties_accounts_account_id_fkey;
       public          superdangerbro    false    287    300    5578            �           2606    20243 8   properties_accounts properties_accounts_property_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.properties_accounts
    ADD CONSTRAINT properties_accounts_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;
 b   ALTER TABLE ONLY public.properties_accounts DROP CONSTRAINT properties_accounts_property_id_fkey;
       public          superdangerbro    false    288    300    5586            �           2606    20145 -   properties properties_service_address_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_service_address_id_fkey FOREIGN KEY (service_address_id) REFERENCES public.addresses(address_id) ON DELETE SET NULL;
 W   ALTER TABLE ONLY public.properties DROP CONSTRAINT properties_service_address_id_fkey;
       public          superdangerbro    false    295    5600    288            �           2606    20229 -   users_accounts users_accounts_account_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.users_accounts
    ADD CONSTRAINT users_accounts_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id) ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.users_accounts DROP CONSTRAINT users_accounts_account_id_fkey;
       public          superdangerbro    false    299    287    5578            �           2606    20224 *   users_accounts users_accounts_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.users_accounts
    ADD CONSTRAINT users_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.users_accounts DROP CONSTRAINT users_accounts_user_id_fkey;
       public          superdangerbro    false    5588    299    289            �   �  x�u��n1E��_�?P-��vU�"��$6l�dFyL43��q&D!�YW%��=U1{��}$�Z0�뽵Ч��tޗ�vZ�x"G��tAޘ7�5���<����M��Fb
�YAf���S�5�t��������vF��	P��`fB�)�K���-7���p�������nC[9�kn���������;*Ս��*�v�`����b1z�Gs� ����
T��h�R,ӗ��o���?�-�ob/h^4
^�pq�@�k�Φ�c��:��5�1T�F�������ϥWl��P�O��3��YC��jΣ�l��%���bW���>����7oBk$O�N,-�6�Md��Iq�y-/�r+&�]�0�J`4\��*�J�������<3z�)�ä�br��e�ڬ�S{������o^VE{���E��F���6Ŕ}�dC�ĖG�@�c��|��<�|�����ga�y      �   Z  x��ZM��=O���l�X,���X���r�g,�� Yv���[�t�*��l^�ƞ��x�^qS��j�F�6�%�c���#���u�����߾���Y9}��Է���ߝ�z����<�z��/�.������9|O�����?9�!2d��>X~�e�����-݋�B�0�a��jJ�l��,���n�����t���ʃ���kū�r2Aqz�qev6�	��s�j6��^M"RcC����$����f���
Y�'�c��"�D��:ꍒ�H�d|��Q�/.���q��-�Ǭ�]Q�H{���%��r�ͨ��8�SA��rl.��#=��/h@$
���=��i�}tAF[�׮(��L#���lM'/Qί~���{�.�����;ݶ��{���v�P';���_�_���kT(<�[��h^�i�D�V�1�)�T怱���|�@�yN/@H&+��H^�e�����ѩ�%���Ͷ7l0>��k݌�U����w�E>;�2�OVpH�z��(�$��ԉrh7JޙR��Qi�s7^�%2�-:	�L�Ė4tpո�1�NȤ. l��[r�����桕)E��<�F�lO��k�@��)���b���ʓI����0/k���ǵ�.(`�KN���e��M�CO�(ɷ;���m�!�;�u]�@��OT�|YSK7�{!sωO���]��=0��㟧˿�z����O߼{���7��z9BF�@�[�s:D�y��>\*�@B���������b㉤)�±޳�>�.�D�*�6vp���+)�9-DBw���`�t�'��"��R����%�Ɂ�� =�Ę�X��4�� ��̊�}�����^*�m����t�e=Д3X�*�oj|�"{~��0��
)a�Ȗ#��	�W�����"��B��a%Ŋ���}]j����f`VQcf�m��ⲫ������w�cV�(��>���2���v�\��`t�b�XɃS��*����_B�c�5$��m����� ޯ$S>aq��)gH*�W�I��bJ	O"��-��o\�(��/�&��F�1ʆzŀ���F���4Œ(���	�xۈ���G����M�5�\Z�����z&��R�iV��uz��6��쒇��de����d_�g�������K�Dk½9E�o��>��Jбk8��}�/�#\A�US/��g�\
�[��G�� ߜ�֢�iLڳ�N\˝���8�\ 3�@�8�F)V��bJ������u�a�o��1�HlO 7���R�AqA���]�mN��&,uhKOB�I�4;aπ���s�����A2���6
�������g�,�&�@�nd�Qt	j���iC] ���qib]��������>�ŋ��a/�<0��*A/ذ�Z�-YT��l���=�n���$Xx�u�V��
硉��i]N��EH�@ӂSR�KM��)T�1w������	�_�M �dS�}t��A$Ӏ K�w��ɴ�H~D��Gr���	Y��r_r}.B��bf��Ç��]U�86��`74���&1fq����[t@(66���]���(�J����	�������i���{\��2�p�q�,,����.�W�f�C�bf&gW����~�U�c��$��<PM2���a����j����Z��΂v��8�ܺ`=w{o8�.�7/�Z8�Ҧ�X+��R�njvY����ҧy���{���2D�����
9V�>�X�
��{;�qs���p�p]Z���͘��û�Te�foü�nn$���\H��q�����~}\ؗt�#�j��+ըB)��s֨����܊<qr?|�Τ�øv]�}<7c����kĤԚ��6��88/���[��\���E8��a� ������6L����Sއ/�P,�G�u� �mt)^��?���1㒘Q�6���L��w�K����^�9f��us���%wu�:�+ 49O2x��)	s�����R\�V��v�P���[=��z���D�X�/qR��`��l�%�q�P��x�W�y��%@�B�zU�iDB!��ǁax	�shW�$=D�qt�P+�#���r���0�!e��p�t����O�^��c.��;�&����չ:`KjQSZ$SUÈ�cX���	߽�#�JvQ,@���R��XkZH&�`ʕ�`��+h��0s]H��`0
<����!d �-������܃��9!��	����ח��[��1�v��R4��wD�t鏢��s��7�U���h]r�9��n��|��iML~U�E3�S��r��S�&�T�^�|uI���=Q6��E�*%� � �Ӄ_��D��k����,;,l�B�Į�Q���5��;aՈ���r]�-[���Ӕ4�v5�mr�{��P�y�qƏD�(�i�$�/=����LF/��{��+��{+���!{]bJE �L�y�&$4AP�2B_���(}p��E��T��d�U�S�&%;=�kc��y5���/z����e欫cY�T���n���B���'�?q���,��TYq�\X=t��q�t�1�!��z��7s�o�Aȹ���D��c����o�Y����TR�/���/�i�~�v]���6�i �'H�����5S-tg)�'�4e ���D�a�چ����9eS�gkE��J�x�?/4��x�ʛ �,8�7LN��������������wP9�~�����`��.`�>�E@�0,Pj6·��v�i��@Sא?��Mtim�	��1��p�ʢ�X��;�^��8�w#��oo���B��� �i��2��,UK���}��)�B���-o\����R����S�����"���b�],���3��w�9�ȶ��6;�.�\�e�/ˁ�      �   ?   x�K�+�,���M�+�LI-K��/ ���Ltt�̭LL���L�L���Hq��qqq �xZ      �   y   x�}�;1��\�+Ǳ7��l��#Qq~@�1ś�z�����A��3Xb���D��]�4ڽwehe�P��WՆ� ?�K8�a�}�MH	��B�=�6˨��������b�O��*�      �   �  x���Mo�6��+_[
������l���)��#^�J/E�{i;�&i���.G��;#D�yB6b2�:6~�h\��%�8*W'�';T��S%Y�	Q�<EG�������ewx����,�A./��:騗Ny����C܄�����=�q��5W�D`�ʆ�A�V����U۠Ԫ�Ν�T��r��"a��:���Y�?�]�w����2w����8���|����mw�����qY�s�$<�&sN.8!�m�1ϳ�	n��ַ�g���n�����i��p�53;>-���NS�N��6�Os���s�Ǚ�S4!�`�((^��7�)����UG}k��%����FV���h�C`�/lެuBd�����o��s����$2e 0���&a�3L<��c�Q���z��s���N��5��7H�����H�����J_U_�<�yx���C�����M��j(h(�Nd��l<PB;�mlB�z�᩻���a�����r̀*��M�<m���L%�����>T��ܗ=�O���#eꄐ��<��@	O(sǸ<M������m��v�Sx�k�AE�=��ڃ�zQ�|A��>����b�pL�8�a�u%2�()��F�g�a��0��*����T S�j&�7\^�BP��)=�`�g�򵾻���P      �      x������ � �      �   $  x�����AE㚯�|������h7��KZi�FLϊϧG�����JuD���H���	V3��)Il���Q��J#��[#Sr���w�K�oǏ�j?�?<�}�,@�ƍp\���� ����hüF*�˓~z|�7_���������g�����[SF�T�A�:�����gV��jo��8'�r�
�Xu���x��Gn��OQ�ƧSl)��j���
F�����dp�2<�l������l�g�q��� .���3meV���bZ�XJ�������o��r�0ӂ�      �   �  x�}�Qo�0ǟsf
6�vm�I���i/{q��X��5���1.��������h�IvE��4����Ϯ���	[I*�f2��J]˾V��4�V��-�>;Ep�M�5h�	�w��K��&��`����Ue��{]����ު�'P ��C��>w�|m�{��vϵ�`��Z:j��ݩ�Q�����0
�h�� &>�1���f�8���M��d�������Y��b�
���4���<�K��,3���Ø'��3������kz*�"���G�M��笺�%^�<z|~��uS�6a���x���i��4%�[� �F'���K����2�$�q�q�pl���HH�,���yK c�rX�X�ba8uR���9`��
��J}����7#��h���T������A`6�K<7R�#t��!�;�qbw�!7?�zA#
"����3�M�K�u�5���LO �|�-���ٴ�;�W�Ɨ���4qU���_ ���s~      �   �  x���A�!E��S�XPTA�;�e�H�2C��؎<�H�}p�lF�f`ҫ�꫄��ǫ��ĚWN9Rr)���B)fj$3jy | )��Ҍ�G0e�5v��rJ��vyz�m����K�[.������R����������肥9��������(�-�M�k'�c�a��Qw	 .�y�]bY����3u�p�@���*����<�ҹf�����9Ls��ة�����DymӺV�2s�JH&��&Y�v]	�����s�Ev�jʕ�.)߶�e����Xη-=��q�M]9��R�XkQ@�h�+�GdpOS�4��S�6h;�;(I�h�|����^/�����?�-�6O�?�h8h�.z����hQ�.!�j�<u�EƆ���°1���M�ęA�+W:lU�w�[��@�'NA:jv���?j�a��6�^k.¥\�ȒsM+z�/�S��{|?���/�V��      �   �   x���An�@�;��}��0o�e������%�V��Ju�KДuMgp!�'W*�*�GXOK4�"
$���d�9�h�F �� h{WQ�'�ߴ�'$JH%�!������w�{�7�q� ݝT����m���/�RUk1�]u�
>��	���s��j�?%������^V$\�      �   -   x�32021404707130�2B���pMa�FƆf&F@�1z\\\ �R�      �   O  x��V�n�6}��Bp�x��m�mҢH
�C$5�Օ%W��,��%�m)6-j�q�CrΜ�aC���WqGJ�	�H
�u�0�{Wo7І��aq�e����lua�;Ȯ�u׮�d������dR�t]���=4�CB�mr�.DB.�8�q��H��>�����K�A�A������&����=�q��6D������u:���|Y��8�Ok�!k�ag��5��!.��&;V�u�����5�����z���w��q�s{fu;�%d6s��)��nz��rn�-��o�|iG��n7������1a�u�˩!����+�r�rD0b8#���:�T#��8Y�a�aS\P�k�)UѺT�Ԕ:���#��
Ym+��j�S�����d�t�y��R?���u�9%2�(��k�J/Qe���x�XX�]��i_V_����&&=r��dRV�0�I�[�{Hнmvc*�w�eN�JN|i�s�=������.
�-cnN����A14���8f$�*f��E�ʈ.0-�ɱ���D���J�%"�)Ĺ��"� '�+���[l�n}x86���.!���m&'�O�1ʃǻn������ο
�v���0���<�MG"dR-U'��Z01�	��x!s.��#MPQY�D��X	���J�,���R
~P�s����xv�y��:���C�q����NR�z�jS-"�X�$EPQ˹q�q�c�+&c�C,J���ν�Fp�	����:*z*S���`g���35�@9doCHz��[�E��f�c�ĆB2��FsI��)��q�h2.=�Ա諵�:���T>�2
�њ�#��5��g�����=޶7Sm�咽���wӪ�&�?^\����V:��ۛ^Xe~pZ`�K��g�7�ɕ1���Ka��
U�|T���a�8S:�$a
��� ���K-��ؔ�MG>�1�aQ0^�k%%�����0�y
D��0�Y�*Ho�x��S�& 	�Ǖ�Κ��+j�L��nZgw	�v��h7�nV��6��&�O��!��mc=� f-�iB2aRo�Ǆɉ���#��Q@8��r�8Չ���r��f�	      x      x������ � �      �   �   x�m��j1���)�J�E�՛xX\-]{d�m`�Y�X�Oo�]�PsK�?�}SW��rWm7������c���WO�i����m^����tƄ��l'}���ǎ��a�H�Z�>8�6x@K�-�5�F�]qf�8U�H�	�:ҿ���b�&Me�A�O'Sk����A+1}ǁK�:�i�#f>`��c����PVMf96�Ľ�6�7�x�VJ� `�x�      �      x������ � �      �      x������ � �      |      x������ � �      }      x������ � �      ~      x������ � �            x������ � �      z      x������ � �      {      x������ � �     