PGDMP      '            	    |           field_hive_development    16.3    16.4 j    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
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
                   false    4    2    12            �           0    0     EXTENSION postgis_tiger_geocoder    COMMENT     ^   COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';
                        false    5                        2615    17548    topology    SCHEMA        CREATE SCHEMA topology;
    DROP SCHEMA topology;
                rdsadmin    false            �           0    0    SCHEMA topology    COMMENT     9   COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';
                   rdsadmin    false    11                        3079    17549    postgis_topology 	   EXTENSION     F   CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;
 !   DROP EXTENSION postgis_topology;
                   false    2    11            �           0    0    EXTENSION postgis_topology    COMMENT     Y   COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';
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
       public          superdangerbro    false                       1259    18302    accounts    TABLE     �  CREATE TABLE public.accounts (
    account_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying,
    billing_address_id uuid,
    type character varying NOT NULL
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
       public         heap    superdangerbro    false    2064            )           1259    20174    field_equipment    TABLE     �  CREATE TABLE public.field_equipment (
    equipment_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid NOT NULL,
    equipment_type_id text NOT NULL,
    location public.geometry(Point,4326),
    is_georeferenced boolean DEFAULT true,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
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
       public         heap    superdangerbro    false    6            (           1259    20157    jobs    TABLE     �  CREATE TABLE public.jobs (
    job_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_id uuid NOT NULL,
    job_type_id text NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    title text
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
   properties    TABLE     `  CREATE TABLE public.properties (
    property_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name character varying(255) NOT NULL,
    location public.geometry(Point,4326),
    boundary public.geometry(Polygon,4326),
    billing_address_id uuid,
    service_address_id uuid,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
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
       public          superdangerbro    false    291    292    292            �          0    18302    accounts 
   TABLE DATA           n   COPY public.accounts (account_id, name, created_at, updated_at, status, billing_address_id, type) FROM stdin;
    public          superdangerbro    false    287   |�       �          0    20134 	   addresses 
   TABLE DATA           �   COPY public.addresses (address_id, address1, address2, city, province, postal_code, country, label, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    295   ��       �          0    18162    ar_internal_metadata 
   TABLE DATA           R   COPY public.ar_internal_metadata (key, value, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    286   ��       �          0    18563    equipment_inspections 
   TABLE DATA           �   COPY public.equipment_inspections (inspection_id, equipment_id, inspected_by, barcode, notes, image_url, created_at, updated_at, status) FROM stdin;
    public          superdangerbro    false    290   ќ       �          0    20174    field_equipment 
   TABLE DATA           �   COPY public.field_equipment (equipment_id, job_id, equipment_type_id, location, is_georeferenced, status, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    297   Q�       �          0    20192    field_inspections 
   TABLE DATA           �   COPY public.field_inspections (inspection_id, equipment_id, inspected_by, status, barcode, notes, image_url, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    298   n�       �          0    20157    jobs 
   TABLE DATA           t   COPY public.jobs (job_id, property_id, job_type_id, status, description, created_at, updated_at, title) FROM stdin;
    public          superdangerbro    false    296   ��       �          0    19149 
   migrations 
   TABLE DATA           ;   COPY public.migrations (id, "timestamp", name) FROM stdin;
    public          superdangerbro    false    292   "�       �          0    18323 
   properties 
   TABLE DATA           �   COPY public.properties (property_id, updated_at, created_at, name, location, boundary, billing_address_id, service_address_id, status, property_type) FROM stdin;
    public          superdangerbro    false    288   ɠ       �          0    20236    properties_accounts 
   TABLE DATA           ^   COPY public.properties_accounts (property_id, account_id, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    300   ٢       �          0    18155    schema_migrations 
   TABLE DATA           4   COPY public.schema_migrations (version) FROM stdin;
    public          superdangerbro    false    285   J�       �          0    20124    settings 
   TABLE DATA           J   COPY public.settings (id, key, value, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    294   ��       x          0    16788    spatial_ref_sys 
   TABLE DATA           X   COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
    public          rdsadmin    false    224   f�       �          0    19183    typeorm_metadata 
   TABLE DATA           E   COPY public.typeorm_metadata (type, schema, name, value) FROM stdin;
    public          superdangerbro    false    293   ��       �          0    18365    users 
   TABLE DATA           �   COPY public.users (user_id, username, email, phone, is_contact, updated_at, created_at, first_name, last_name, password_digest) FROM stdin;
    public          superdangerbro    false    289   k�       �          0    20215    users_accounts 
   TABLE DATA           [   COPY public.users_accounts (user_id, account_id, role, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    299   ��       |          0    17751    geocode_settings 
   TABLE DATA           T   COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
    tiger          rds_superuser    false    235   ��       }          0    18085    pagc_gaz 
   TABLE DATA           K   COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
    tiger          rds_superuser    false    280   §       ~          0    18095    pagc_lex 
   TABLE DATA           K   COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
    tiger          rds_superuser    false    282   ߧ                 0    18105 
   pagc_rules 
   TABLE DATA           8   COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
    tiger          rds_superuser    false    284   ��       z          0    17551    topology 
   TABLE DATA           G   COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
    topology          rdsadmin    false    229   �       {          0    17563    layer 
   TABLE DATA           �   COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
    topology          rdsadmin    false    230   6�       �           0    0    migrations_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.migrations_id_seq', 54, true);
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
       public            superdangerbro    false    289    289            �           2606    20223 "   users_accounts users_accounts_pkey 
   CONSTRAINT     q   ALTER TABLE ONLY public.users_accounts
    ADD CONSTRAINT users_accounts_pkey PRIMARY KEY (user_id, account_id);
 L   ALTER TABLE ONLY public.users_accounts DROP CONSTRAINT users_accounts_pkey;
       public            superdangerbro    false    299    299            �           1259    20156    idx_accounts_billing_address    INDEX     _   CREATE INDEX idx_accounts_billing_address ON public.accounts USING btree (billing_address_id);
 0   DROP INDEX public.idx_accounts_billing_address;
       public            superdangerbro    false    287            �           1259    19376    idx_accounts_status    INDEX     J   CREATE INDEX idx_accounts_status ON public.accounts USING btree (status);
 '   DROP INDEX public.idx_accounts_status;
       public            superdangerbro    false    287            �           1259    20191    idx_field_equipment_job    INDEX     U   CREATE INDEX idx_field_equipment_job ON public.field_equipment USING btree (job_id);
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
       public            superdangerbro    false    288    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2            �           1259    19281    idx_properties_location    INDEX     Q   CREATE INDEX idx_properties_location ON public.properties USING gist (location);
 +   DROP INDEX public.idx_properties_location;
       public            superdangerbro    false    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    288            �           1259    20155    idx_properties_service_address    INDEX     c   CREATE INDEX idx_properties_service_address ON public.properties USING btree (service_address_id);
 2   DROP INDEX public.idx_properties_service_address;
       public            superdangerbro    false    288            �           1259    20235    idx_users_accounts_account    INDEX     [   CREATE INDEX idx_users_accounts_account ON public.users_accounts USING btree (account_id);
 .   DROP INDEX public.idx_users_accounts_account;
       public            superdangerbro    false    299            �           1259    20234    idx_users_accounts_user    INDEX     U   CREATE INDEX idx_users_accounts_user ON public.users_accounts USING btree (user_id);
 +   DROP INDEX public.idx_users_accounts_user;
       public            superdangerbro    false    299            �           2620    18689 #   accounts update_accounts_updated_at    TRIGGER     �   CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 <   DROP TRIGGER update_accounts_updated_at ON public.accounts;
       public          superdangerbro    false    287    945            �           2620    18641 =   equipment_inspections update_equipment_inspections_updated_at    TRIGGER     �   CREATE TRIGGER update_equipment_inspections_updated_at BEFORE UPDATE ON public.equipment_inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 V   DROP TRIGGER update_equipment_inspections_updated_at ON public.equipment_inspections;
       public          superdangerbro    false    945    290            �           2620    18673 '   properties update_properties_updated_at    TRIGGER     �   CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 @   DROP TRIGGER update_properties_updated_at ON public.properties;
       public          superdangerbro    false    288    945            �           2620    18705    users update_users_updated_at    TRIGGER     �   CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 6   DROP TRIGGER update_users_updated_at ON public.users;
       public          superdangerbro    false    945    289            �           2606    20150 )   accounts accounts_billing_address_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_billing_address_id_fkey FOREIGN KEY (billing_address_id) REFERENCES public.addresses(address_id) ON DELETE SET NULL;
 S   ALTER TABLE ONLY public.accounts DROP CONSTRAINT accounts_billing_address_id_fkey;
       public          superdangerbro    false    287    5595    295            �           2606    20186 +   field_equipment field_equipment_job_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.field_equipment
    ADD CONSTRAINT field_equipment_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(job_id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.field_equipment DROP CONSTRAINT field_equipment_job_id_fkey;
       public          superdangerbro    false    296    5598    297            �           2606    20203 5   field_inspections field_inspections_equipment_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.field_inspections
    ADD CONSTRAINT field_inspections_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.field_equipment(equipment_id) ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.field_inspections DROP CONSTRAINT field_inspections_equipment_id_fkey;
       public          superdangerbro    false    298    297    5600            �           2606    20208 5   field_inspections field_inspections_inspected_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.field_inspections
    ADD CONSTRAINT field_inspections_inspected_by_fkey FOREIGN KEY (inspected_by) REFERENCES public.users(user_id) ON DELETE RESTRICT;
 _   ALTER TABLE ONLY public.field_inspections DROP CONSTRAINT field_inspections_inspected_by_fkey;
       public          superdangerbro    false    289    5585    298            �           2606    20168    jobs jobs_property_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_property_id_fkey;
       public          superdangerbro    false    288    296    5583            �           2606    20248 7   properties_accounts properties_accounts_account_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.properties_accounts
    ADD CONSTRAINT properties_accounts_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id) ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.properties_accounts DROP CONSTRAINT properties_accounts_account_id_fkey;
       public          superdangerbro    false    287    5577    300            �           2606    20243 8   properties_accounts properties_accounts_property_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.properties_accounts
    ADD CONSTRAINT properties_accounts_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;
 b   ALTER TABLE ONLY public.properties_accounts DROP CONSTRAINT properties_accounts_property_id_fkey;
       public          superdangerbro    false    5583    288    300            �           2606    20145 -   properties properties_service_address_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_service_address_id_fkey FOREIGN KEY (service_address_id) REFERENCES public.addresses(address_id) ON DELETE SET NULL;
 W   ALTER TABLE ONLY public.properties DROP CONSTRAINT properties_service_address_id_fkey;
       public          superdangerbro    false    288    5595    295            �           2606    20229 -   users_accounts users_accounts_account_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.users_accounts
    ADD CONSTRAINT users_accounts_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id) ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.users_accounts DROP CONSTRAINT users_accounts_account_id_fkey;
       public          superdangerbro    false    287    299    5577            �           2606    20224 *   users_accounts users_accounts_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.users_accounts
    ADD CONSTRAINT users_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.users_accounts DROP CONSTRAINT users_accounts_user_id_fkey;
       public          superdangerbro    false    299    5585    289            �   4  x�]��N�@E��+��l���hi���f�"b�"m��ghx�����ɬ��;��4HBؤ�3z�N��״���|��y�,w{Y'F�q��hmD\��;2�����jZ릻=�c{o�z�%w�aU5%H�w[-��2ݜ_���1'+�|%0Z<"�z$Rq^ezh�c+�vY��o=�(�������<W�y���U�K5P'��
Z���ζo=.�k�@�k���+���v���叀�"�}�;��ә�4�0�7T_s#�Ҿ�뾀7�Pi��4�]���^�i~Z�y���z�      �   �  x���=�1���+�#�<���ގK�� �CAH��c�D
	����ӑ��Bиy?~g��F�͛�70��s3��9n�Ş���ѷ�R�|���G9���V[�h�8���ܲ����uh�o��	`Ct@��c8X������9V=8� �*lkRH����O��霏�䬿�k��[���߀фi�4ƀ�\;k"7�u�Ӆ��R-3�.4�lR���0��ȺPPŘ�^K^v�t��E�~�����~�W�����Ͻ�O�?�7�.L�gN�_*O��!X�pQF� ������M��L�X�������Җ�1� �|�/ӡ��!�5(ܗn6�2�4�R|��_��J��Q:�2%2� Wc������O�_4�e��?���=����5\�K��8#��2��Y"x��V��d6)CoN��� �_���a~K��      �   ?   x�K�+�,���M�+�LI-K��/ ���Ltt�̭LL���L�L���Hq��qqq �xZ      �   p  x���I�1E�Y��"�Q��C��QJ!�k���h���P��XBB��x|*�F������0��Yk��VuH
�7E��X�cڠ��>�^�F,�=�_��@\�1]%����?HZ�?�ʋv�Q��v�Ed
�R��Nƣ#��l]|��9+=�N��5%�`-���:C�L��p�2�ڌ
\�������������1����>k��4[�{�b�Gя�|���z^���:�]AC(�X��<�r
:�?}KX�L�j����W�cvБh����Y��t4����FM5թА�6�|f���rK�#�Ry�ܸCb��2(u]MV&�Lbͯl����^���l�;�F'��~�\~�E��      �      x������ � �      �      x������ � �      �   �   x�]�1�  �^ѽrd����?�T1UZ%�_U�Χk�6ޖ���+��� ��cs��mY4!(�$P�H��,�{��Ws{}�����t���Y��(��+��Y�;��d�E�eW���{�z�+�      �   �  x�m�Mo�0������W�c׭S'm�Z�]vI�j#��A����w�?�l�N���J?	��-ޫ�i<�g,��?��%�ɂ����m)_Y�a ��:UV5>�z᧚i�$! t��[~Y�j�nֲx�U��殏� rV`�d��2vh�uQt��!���Z���\��56� vVt���<�A���lX�]�!C�@��V9`��s�0���BL�^���ۣ H�<e���:��>OR̰_�D_c��:cNE�cG{3z�Q�_-�J��x����PԺۂ��w�S���W=��+2��E��s�Y���Y|(C�9��ӭ`[��		���x6�@��l�Mr:��>uR�(�P��b��`9��?d�����4#D!�<�YƵ�L���|��/cg(�      �      x����n�0���S����H��-u;l�;�"���K����Om�u��l�>�����P7F��I\��;�k��
b���Cp>��w�Rc���@:�2$� �j�����ڛ�������we��CX�z<��D�����}���O�~�!�H	J��x���']]1{	�\Z��H�֗+и�U�~���
$}=�����=���Ư(\���on?=�?l7mw_�����N�|�56��T���.�
���Z�Y��g��g�ePf�g��"w^;/K�\�F�=x/��a3�SN�%�����&F��L�%`ܑ�@�Ȝ����(�hc��������fw>m��c�y����a����G3��E�UsD�K��3�j�����ˢ�́�l��崽���0K�2�!�.��ǩ+��_�;�%KEޒ>���^��G{�MŲ18!�i|]�1Ev���h45�b�-��l�[�5�i�%!ҫ�].��%�\      �   a   x�}ɱ�0�ښ"}@��"ѳ�mj��A�=,��
J̄�$��G�8Tan��J���}�N�=�{Pi����e�t�p����m��Z�9�      �   -   x�32021404707130�2B���pMa�FƆf&F@�1z\\\ �R�      �   �  x���Mo�@�����r����o���S��z<#�����w�I�&i�	q�vgv�O�yg�(]�LB2ʱ�=2#�м2PĐ௩^�c;~�8N���r�&..��U����M[b�}�u;b[�?Nc�U�5��"w��R3���0���K�V��Ϧ�%�J0�D�tU��W��AVVI�Ǳn���b|X�ȳ��qcC����~ۇ�q�	�<�6��ɫ���u9���p���Q�Y��=�5]?& ��t��K�5}-�Bۛ���c��_8��j���=[�}O����iX!��<*�����.v�S����q6U<�¢b\��U2/�f��V�"�jۘ��j���d�a�Ѫ�r+���g��J�9l
d�(��!"(��j&�D��,���gW<���$�ٵ3ȉ�?�*���������ˌ}ʩe���:��Γl�x�,�N��eŢ�s&��p<�����l�|��R	���>�ʦ�m)�.����zBU��2D )�U߭��fo�C#^����[W}"'ͦ= W�&
B0�syx.�*WiÁD�%=Q ��L��#���x|�]�C]�<�nVi�ﱇ��4���.~�k��q�w�n����d%R�-�}6�ԖR^ͪB`��fΡNx�A�h�s��Zy)�k�l��%0��dZ��F��@�&���V�!X� �� ����2M�?���t      x      x������ � �      �   �   x�m��j1���)�J�E�՛xX\-]{d�m`�Y�X�Oo�]�PsK�?�}SW��rWm7������c���WO�i����m^����tƄ��l'}���ǎ��a�H�Z�>8�6x@K�-�5�F�]qf�8U�H�	�:ҿ���b�&Me�A�O'Sk����A+1}ǁK�:�i�#f>`��c����PVMf96�Ľ�6�7�x�VJ� `�x�      �      x������ � �      �      x������ � �      |      x������ � �      }      x������ � �      ~      x������ � �            x������ � �      z      x������ � �      {      x������ � �     