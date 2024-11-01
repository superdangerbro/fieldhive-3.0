PGDMP                  	    |           field_hive_development    16.3    16.4 l    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
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
       public         heap    superdangerbro    false    6            (           1259    20157    jobs    TABLE       CREATE TABLE public.jobs (
    job_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_id uuid NOT NULL,
    job_type_id text NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
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
       public          superdangerbro    false    292    291    292            �          0    18302    accounts 
   TABLE DATA           n   COPY public.accounts (account_id, name, created_at, updated_at, status, billing_address_id, type) FROM stdin;
    public          superdangerbro    false    287   ��       �          0    20134 	   addresses 
   TABLE DATA           �   COPY public.addresses (address_id, address1, address2, city, province, postal_code, country, label, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    295   ɞ       �          0    18162    ar_internal_metadata 
   TABLE DATA           R   COPY public.ar_internal_metadata (key, value, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    286   ��       �          0    18563    equipment_inspections 
   TABLE DATA           �   COPY public.equipment_inspections (inspection_id, equipment_id, inspected_by, barcode, notes, image_url, created_at, updated_at, status) FROM stdin;
    public          superdangerbro    false    290   �       �          0    20174    field_equipment 
   TABLE DATA           �   COPY public.field_equipment (equipment_id, job_id, equipment_type_id, location, is_georeferenced, status, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    297   ��       �          0    20192    field_inspections 
   TABLE DATA           �   COPY public.field_inspections (inspection_id, equipment_id, inspected_by, status, barcode, notes, image_url, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    298   ��       �          0    20157    jobs 
   TABLE DATA           �   COPY public.jobs (job_id, property_id, job_type_id, status, description, created_at, updated_at, title, use_custom_addresses, service_address_id, billing_address_id) FROM stdin;
    public          superdangerbro    false    296   ��       �          0    19149 
   migrations 
   TABLE DATA           ;   COPY public.migrations (id, "timestamp", name) FROM stdin;
    public          superdangerbro    false    292   �       �          0    18323 
   properties 
   TABLE DATA           �   COPY public.properties (property_id, updated_at, created_at, name, location, boundary, billing_address_id, service_address_id, status, property_type) FROM stdin;
    public          superdangerbro    false    288   ��       �          0    20236    properties_accounts 
   TABLE DATA           ^   COPY public.properties_accounts (property_id, account_id, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    300   x�       �          0    18155    schema_migrations 
   TABLE DATA           4   COPY public.schema_migrations (version) FROM stdin;
    public          superdangerbro    false    285   ů       �          0    20124    settings 
   TABLE DATA           J   COPY public.settings (id, key, value, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    294   �       x          0    16788    spatial_ref_sys 
   TABLE DATA           X   COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
    public          rdsadmin    false    224   ٲ       �          0    19183    typeorm_metadata 
   TABLE DATA           E   COPY public.typeorm_metadata (type, schema, name, value) FROM stdin;
    public          superdangerbro    false    293   ��       �          0    18365    users 
   TABLE DATA           �   COPY public.users (user_id, username, email, phone, is_contact, updated_at, created_at, first_name, last_name, password_digest) FROM stdin;
    public          superdangerbro    false    289   ޳       �          0    20215    users_accounts 
   TABLE DATA           [   COPY public.users_accounts (user_id, account_id, role, created_at, updated_at) FROM stdin;
    public          superdangerbro    false    299   ��       |          0    17751    geocode_settings 
   TABLE DATA           T   COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
    tiger          rds_superuser    false    235   �       }          0    18085    pagc_gaz 
   TABLE DATA           K   COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
    tiger          rds_superuser    false    280   5�       ~          0    18095    pagc_lex 
   TABLE DATA           K   COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
    tiger          rds_superuser    false    282   R�                 0    18105 
   pagc_rules 
   TABLE DATA           8   COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
    tiger          rds_superuser    false    284   o�       z          0    17551    topology 
   TABLE DATA           G   COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
    topology          rdsadmin    false    229   ��       {          0    17563    layer 
   TABLE DATA           �   COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
    topology          rdsadmin    false    230   ��       �           0    0    migrations_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.migrations_id_seq', 55, true);
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
       public            superdangerbro    false    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    288            �           1259    19281    idx_properties_location    INDEX     Q   CREATE INDEX idx_properties_location ON public.properties USING gist (location);
 +   DROP INDEX public.idx_properties_location;
       public            superdangerbro    false    288    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2    2            �           1259    20155    idx_properties_service_address    INDEX     c   CREATE INDEX idx_properties_service_address ON public.properties USING btree (service_address_id);
 2   DROP INDEX public.idx_properties_service_address;
       public            superdangerbro    false    288            �           1259    20235    idx_users_accounts_account    INDEX     [   CREATE INDEX idx_users_accounts_account ON public.users_accounts USING btree (account_id);
 .   DROP INDEX public.idx_users_accounts_account;
       public            superdangerbro    false    299            �           1259    20234    idx_users_accounts_user    INDEX     U   CREATE INDEX idx_users_accounts_user ON public.users_accounts USING btree (user_id);
 +   DROP INDEX public.idx_users_accounts_user;
       public            superdangerbro    false    299            �           2620    18689 #   accounts update_accounts_updated_at    TRIGGER     �   CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 <   DROP TRIGGER update_accounts_updated_at ON public.accounts;
       public          superdangerbro    false    287    945            �           2620    18641 =   equipment_inspections update_equipment_inspections_updated_at    TRIGGER     �   CREATE TRIGGER update_equipment_inspections_updated_at BEFORE UPDATE ON public.equipment_inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 V   DROP TRIGGER update_equipment_inspections_updated_at ON public.equipment_inspections;
       public          superdangerbro    false    290    945            �           2620    18673 '   properties update_properties_updated_at    TRIGGER     �   CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 @   DROP TRIGGER update_properties_updated_at ON public.properties;
       public          superdangerbro    false    288    945            �           2620    18705    users update_users_updated_at    TRIGGER     �   CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 6   DROP TRIGGER update_users_updated_at ON public.users;
       public          superdangerbro    false    945    289            �           2606    20266    jobs FK_jobs_billing_address    FK CONSTRAINT     �   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "FK_jobs_billing_address" FOREIGN KEY (billing_address_id) REFERENCES public.addresses(address_id) ON DELETE SET NULL;
 H   ALTER TABLE ONLY public.jobs DROP CONSTRAINT "FK_jobs_billing_address";
       public          superdangerbro    false    5596    296    295            �           2606    20261    jobs FK_jobs_service_address    FK CONSTRAINT     �   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "FK_jobs_service_address" FOREIGN KEY (service_address_id) REFERENCES public.addresses(address_id) ON DELETE SET NULL;
 H   ALTER TABLE ONLY public.jobs DROP CONSTRAINT "FK_jobs_service_address";
       public          superdangerbro    false    296    295    5596            �           2606    20150 )   accounts accounts_billing_address_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_billing_address_id_fkey FOREIGN KEY (billing_address_id) REFERENCES public.addresses(address_id) ON DELETE SET NULL;
 S   ALTER TABLE ONLY public.accounts DROP CONSTRAINT accounts_billing_address_id_fkey;
       public          superdangerbro    false    287    5596    295            �           2606    20186 +   field_equipment field_equipment_job_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.field_equipment
    ADD CONSTRAINT field_equipment_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(job_id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.field_equipment DROP CONSTRAINT field_equipment_job_id_fkey;
       public          superdangerbro    false    5599    296    297            �           2606    20203 5   field_inspections field_inspections_equipment_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.field_inspections
    ADD CONSTRAINT field_inspections_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.field_equipment(equipment_id) ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.field_inspections DROP CONSTRAINT field_inspections_equipment_id_fkey;
       public          superdangerbro    false    5601    297    298            �           2606    20208 5   field_inspections field_inspections_inspected_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.field_inspections
    ADD CONSTRAINT field_inspections_inspected_by_fkey FOREIGN KEY (inspected_by) REFERENCES public.users(user_id) ON DELETE RESTRICT;
 _   ALTER TABLE ONLY public.field_inspections DROP CONSTRAINT field_inspections_inspected_by_fkey;
       public          superdangerbro    false    298    289    5586            �           2606    20168    jobs jobs_property_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_property_id_fkey;
       public          superdangerbro    false    288    296    5584            �           2606    20248 7   properties_accounts properties_accounts_account_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.properties_accounts
    ADD CONSTRAINT properties_accounts_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id) ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.properties_accounts DROP CONSTRAINT properties_accounts_account_id_fkey;
       public          superdangerbro    false    5578    300    287            �           2606    20243 8   properties_accounts properties_accounts_property_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.properties_accounts
    ADD CONSTRAINT properties_accounts_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;
 b   ALTER TABLE ONLY public.properties_accounts DROP CONSTRAINT properties_accounts_property_id_fkey;
       public          superdangerbro    false    300    5584    288            �           2606    20145 -   properties properties_service_address_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_service_address_id_fkey FOREIGN KEY (service_address_id) REFERENCES public.addresses(address_id) ON DELETE SET NULL;
 W   ALTER TABLE ONLY public.properties DROP CONSTRAINT properties_service_address_id_fkey;
       public          superdangerbro    false    295    288    5596            �           2606    20229 -   users_accounts users_accounts_account_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.users_accounts
    ADD CONSTRAINT users_accounts_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id) ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.users_accounts DROP CONSTRAINT users_accounts_account_id_fkey;
       public          superdangerbro    false    287    5578    299            �           2606    20224 *   users_accounts users_accounts_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.users_accounts
    ADD CONSTRAINT users_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.users_accounts DROP CONSTRAINT users_accounts_user_id_fkey;
       public          superdangerbro    false    299    5586    289            �   4  x�]��N�@E��+��l���hi���f�"b�"m��ghx�����ɬ��;��4HBؤ�3z�N��״���|��y�,w{Y'F�q��hmD\��;2�����jZ릻=�c{o�z�%w�aU5%H�w[-��2ݜ_���1'+�|%0Z<"�z$Rq^ezh�c+�vY��o=�(�������<W�y���U�K5P'��
Z���ζo=.�k�@�k���+���v���叀�"�}�;��ә�4�0�7T_s#�Ҿ�뾀7�Pi��4�]���^�i~Z�y���z�      �   �  x�͖OoG�ϻ�b���3�[�Q�E	Z�28��.�A�}��k�"ܤ��=P�����8]
���P�UF����#�$A�rY����j?Mo�]�|҇��|����B�~:/w����O�w� �8�!�P֘<�w��kq暇r��1	�� )��#�P�a�	}0�������^���ʘ���$..�B�9Y1'zu�:;I�*"4Mh�)�����6��Dy9�5��ˏ���w}Xޖ��嚖7��Bg�\���ü2�Hx�W2�v�WqC>�Ir�����E �R��1���ҔRN˅���!]�T�:���f��z9��}�����E~�/R��#\�Hβ���s��c�ʤq�6L�J��%C���Ԇ�W�D>��xM>"�޶:ی!q@*f���	s��۷��޴(;RC�����0������و���~o��_/�?�k�r������ലQ86Ȧ:M$&��G���)�)hEɈ����j�G2��E�WsF���H-��3gfZ��i<�<.Θ�Z*�f�")r������,^�FƃV��F�Mu�E%v��,%��K�BԒ���J8�_;��l��vL��y�|����}��Q� %`3�@�["�&�����+t��A!Z"�\`������{jK�B9�9��|b�=���U���Əj�j�Գ�>y��)ǆ͢}Y:�y�}�W��������	�h����م$��%4;�S}�/��-X;��9��vr�ڱ��)��)�sS��V뗩#�W[D�s�@-s�>Y���	��J�E��h)�9�r[���o�f��`��Rs�^��L#�)�&&"�D��^-�B��:1�8	:�ߥ�W��qo.]1	o����]2���=����:� �.vE5�(Mʤ�A/hZ�PǇ�kw�1��wR;�����J��f_l��jB���,[47�j!@���H�t0~�|1Իu�� ] 5j      �   ?   x�K�+�,���M�+�LI-K��/ ���Ltt�̭LL���L�L���Hq��qqq �xZ      �   p  x���I�1E�Y��"�Q��C��QJ!�k���h���P��XBB��x|*�F������0��Yk��VuH
�7E��X�cڠ��>�^�F,�=�_��@\�1]%����?HZ�?�ʋv�Q��v�Ed
�R��Nƣ#��l]|��9+=�N��5%�`-���:C�L��p�2�ڌ
\�������������1����>k��4[�{�b�Gя�|���z^���:�]AC(�X��<�r
:�?}KX�L�j����W�cvБh����Y��t4����FM5թА�6�|f���rK�#�Ry�ܸCb��2(u]MV&�Lbͯl����^���l�;�F'��~�\~�E��      �      x������ � �      �      x������ � �      �     x���MkA�Ͻ�b�RCUwU�-��.�9�?��B��쎈���AE=C��<o��ܜ6R��6�d�R�-{Ϯ��[NR,�LPj��(	����̛��-�˻�栻��ݚ���h��dqM�f�-~���鵞����L������Ӳ��.Z;��'���({V�;y����ȗ�B���*���K�V(�d���x���#n$���9�8��z7��b�so����/��Dm����-����J@�	�������ḿ=��,�;1N$k�kJ��b�?�Ak7�8S�>^���D�"�HYe`�
���ξ䆦��)������/�<���1j,B��W`�Rv�<K�9Ǝ%G��3�����A�6���x6����GS���;]�=�n띞&�Oj��F�S"�ڞ�.��������r����ژnڀ�*�L����Q���%$��RrF�:?�.hC��
�:���sO����$M�(�9T���+!:׋����?���F�s��_������C7��ͼZ���2�      �   �  x�m�MO�0�����״=�	��".\BkA�4�)b��4M�ֳ;��y���'�E����4�t��s����[�*/d�ɣ�}#��ڨ���Ł1�,N�k�v
-�As/�{a�ь���x6n�ס�ͨ�p��co:쭤>������Q(��U�M��M3=׎�`OZ:k�]I��~�>�8�����<���<�AA�~i�9U�.d�(I�ϕ#���Ƴ�~Sk����9�0�*����k��"ߙ7��aΓU!^2��t��8�dl�P�8':��7U���(��e^佂�dy�����m�^��ts�a�ۦ2~Y�@rI�_�)��ʐD��>il�Y��HHbR���� ���~��*�����
dɊ�wO�)Q�����B�^��p�Yʴ�MVI��2n��Y��8��+�� � �)4J      �   �  x��V�n#9}vE}��%���VW4�0�}�I���N�Ӌ��e���q�����;��bQ<<���-Z�/��&.���ĳ�`�Cָ�8w { ����?B���{�=�D�4�k:}����ӱ��_�������w�ҏ�#��c�����Ch�-�Ƕq�-
����=��	^>������1`�a�Z	����^q�
b�7|�Џ��݆?M�E����~�����>�w����n���t���RLFX� g21i�0'=X�I~���p-���"��������xoi�*�gʻ��?�w���R5�.v�F���`�R�L�^ӌ��a|�?��Nw���"��~��~[�F�sw�8����o�^2)��m�4Y�����3"�q
�k�܌������L F뽪1&���eN�-�)����z� $\�����9D0�d1"Au�V����`yD�^4�Jݾ4 �8�>?M������t�����}Y�J��M8HlV��j�&&�i,8g�N�Xl1����&o2�hK)�ǲT�
s!;�MM�2,Lʐ�Y�`*o�@t �k��{�/�������T�:¹�T�ƪ�q*���"fW$y�wI��9����\UX	��U|�� �*���F6�BU>#U�}�6�$�t�n8���{�� �8>~����tj�i�O̵.���F�7�j2�C9�����^����2�M`d�z�T!Iuz��&A���lɿ��>��u�_ӷ����E}6[V��"(��w)ŠW�|5��>�S��2����FN�쬗��wو�Ƶ��$���ɉ{BttQe�{��k��ӗ��~M<q�����Jkqj�n�Z�W�*��,����N��u���*��&�l!���ZK��=jD�8n���������Nd�A��mxp�k�6��vm���ￅ��d59�UP��B�(!��j�RI��r��zբ���t&�9�CM1铮^3KI��U��YM��NSCU�IT��du Z�]". 8x���������������#0�G�c�:������;��u'A((C/!�_1��l��G��eV�q���y�u�=t��ӆߊ�Ͳx��f)u^74ٗ�^�dľ������&îzo�Tt3�J{V+Wo	:	��`F# ��ҿ]L����^|��U�Wȃ1����+�%ĉz���&`t��v�ª�4���-����@4ȆGl��+��i���ya��jMw�����t������ו���w�Tҕ��j���E%�SzQs����n:SW�~���2�\uXS%���Oj�z�����y]��^���N��}eo�)�ݤ�rߜ�ap��N�j)�sݜS�$��úS�d睳g�;un
:���o��W�ױ��٢�f�)��Rz;�0�^κ���#�u�6�¼d�nT:���v��c7�c����*����t\��m��ӧ��6m�      �   =  x���;�#1Dc����O�g�D��G��dv/��P=U���Ճ!|�*���!(*%�L�G�`#F��4�+U`����#+���S�D;������oZ�d_u���t�~$��"��U7�"�����*"��/9~�UB�Y�ha3���Fݸ!�@��uڜ�
�4�m�~���^��"�����ԓ� �x����M�SX��W�Ct�EK�j[��ˢ�v.Z]�b�J��!�=������vM����)rJ�"owZ�^�#�I뚜��rUjݫ}��3��*G���~7X�����&      �   -   x�32021404707130�2B���pMa�FƆf&F@�1z\\\ �R�      �   �  x�}�Ko�@���)���Z�bܢ�r�Z5�)���eH�0�\E��{�8`��X��`~���j�� n	E�1��R�R�,�E����vu����:����Δ���n��]�<t����'_LY�P��MƯC�4Er~W�&��rD0b8!i����5є3�	��{c�l� (e�@��Sd?�����8�#0�}Y?w�۪m�[e���*pC���Ͷ5��ȸ3� ��m��dyW���S-���~�긦j���A׍��/޺����k�`�*�r�_���Ƚ��evY_���a�}?t-�>���d�o��=�k%$��J��ޘaM� ���z��)�9)q�����PM���\��N$=t��V�P哔����QkA������ycG�,��J��!8��F��ѯƾ���AͦA���;����*3&?F�sNN3��BJ%�p�yc�sE����d�)�LP���(=.������5#\��>]xc'UJ�+�����i��ȑ���$J*Ǣ�7-���$����C��
a]�����a�z��g_����7���D$�,KqF��3E�R�k�X�S�w9�T��� �z��r�@����̷�ֻ�p�V�[�qӮ�P@���qA��
[č=,�@����-d\M�6ck��'���?>�kTA t�VU�,�Ψ�]B��g�����:�����      x      x������ � �      �   �   x�m��j1���)�J�E�՛xX\-]{d�m`�Y�X�Oo�]�PsK�?�}SW��rWm7������c���WO�i����m^����tƄ��l'}���ǎ��a�H�Z�>8�6x@K�-�5�F�]qf�8U�H�	�:ҿ���b�&Me�A�O'Sk����A+1}ǁK�:�i�#f>`��c����PVMf96�Ľ�6�7�x�VJ� `�x�      �      x������ � �      �      x������ � �      |      x������ � �      }      x������ � �      ~      x������ � �            x������ � �      z      x������ � �      {      x������ � �     