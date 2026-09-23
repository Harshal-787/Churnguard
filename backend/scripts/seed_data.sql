--
-- PostgreSQL database dump
--

\restrict wv6rpiZ1jNiB4LSF3eGNwpumm8dMmNbHvINSPbXWXHSOSrCP0Q48hdpckCwOBgc

-- Dumped from database version 15.19 (Debian 15.19-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.webhook_events DROP CONSTRAINT webhook_events_webhook_id_fkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_organization_id_fkey;
ALTER TABLE ONLY public.tags DROP CONSTRAINT tags_run_uuid_fkey;
ALTER TABLE ONLY public.runs DROP CONSTRAINT runs_experiment_id_fkey;
ALTER TABLE ONLY public.prediction_history DROP CONSTRAINT prediction_history_model_id_fkey;
ALTER TABLE ONLY public.prediction_history DROP CONSTRAINT prediction_history_customer_db_id_fkey;
ALTER TABLE ONLY public.params DROP CONSTRAINT params_run_uuid_fkey;
ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_user_id_fkey;
ALTER TABLE ONLY public.models DROP CONSTRAINT models_organization_id_fkey;
ALTER TABLE ONLY public.metrics DROP CONSTRAINT metrics_run_uuid_fkey;
ALTER TABLE ONLY public.mcp_server_versions DROP CONSTRAINT mcp_server_versions_server_fkey;
ALTER TABLE ONLY public.mcp_server_version_tags DROP CONSTRAINT mcp_server_version_tags_version_fkey;
ALTER TABLE ONLY public.mcp_server_tags DROP CONSTRAINT mcp_server_tags_server_fkey;
ALTER TABLE ONLY public.mcp_server_aliases DROP CONSTRAINT mcp_server_aliases_server_fkey;
ALTER TABLE ONLY public.mcp_access_endpoints DROP CONSTRAINT mcp_access_endpoints_server_fkey;
ALTER TABLE ONLY public.latest_metrics DROP CONSTRAINT latest_metrics_run_uuid_fkey;
ALTER TABLE ONLY public.trace_tags DROP CONSTRAINT fk_trace_tags_request_id;
ALTER TABLE ONLY public.trace_request_metadata DROP CONSTRAINT fk_trace_request_metadata_request_id;
ALTER TABLE ONLY public.trace_metrics DROP CONSTRAINT fk_trace_metrics_request_id;
ALTER TABLE ONLY public.trace_info DROP CONSTRAINT fk_trace_info_experiment_id;
ALTER TABLE ONLY public.spans DROP CONSTRAINT fk_spans_trace_id;
ALTER TABLE ONLY public.spans DROP CONSTRAINT fk_spans_experiment_id;
ALTER TABLE ONLY public.span_metrics DROP CONSTRAINT fk_span_metrics_span;
ALTER TABLE ONLY public.scorers DROP CONSTRAINT fk_scorers_experiment_id;
ALTER TABLE ONLY public.scorer_versions DROP CONSTRAINT fk_scorer_versions_scorer_id;
ALTER TABLE ONLY public.review_queues DROP CONSTRAINT fk_review_queues_experiment_id;
ALTER TABLE ONLY public.review_queue_users DROP CONSTRAINT fk_review_queue_users_queue_id;
ALTER TABLE ONLY public.review_queue_label_schemas DROP CONSTRAINT fk_review_queue_label_schemas_queue_id;
ALTER TABLE ONLY public.review_queue_items DROP CONSTRAINT fk_review_queue_items_queue_id;
ALTER TABLE ONLY public.registered_model_tags DROP CONSTRAINT fk_registered_model_tags_registered_models;
ALTER TABLE ONLY public.registered_model_aliases DROP CONSTRAINT fk_registered_model_aliases_registered_models;
ALTER TABLE ONLY public.online_scoring_configs DROP CONSTRAINT fk_online_scoring_configs_scorer_id;
ALTER TABLE ONLY public.online_scoring_configs DROP CONSTRAINT fk_online_scoring_configs_experiment_id;
ALTER TABLE ONLY public.model_versions DROP CONSTRAINT fk_model_versions_registered_models;
ALTER TABLE ONLY public.model_version_tags DROP CONSTRAINT fk_model_version_tags_model_versions;
ALTER TABLE ONLY public.model_definitions DROP CONSTRAINT fk_model_definitions_secret_id;
ALTER TABLE ONLY public.logged_models DROP CONSTRAINT fk_logged_models_experiment_id;
ALTER TABLE ONLY public.logged_model_tags DROP CONSTRAINT fk_logged_model_tags_model_id;
ALTER TABLE ONLY public.logged_model_tags DROP CONSTRAINT fk_logged_model_tags_experiment_id;
ALTER TABLE ONLY public.logged_model_params DROP CONSTRAINT fk_logged_model_params_model_id;
ALTER TABLE ONLY public.logged_model_params DROP CONSTRAINT fk_logged_model_params_experiment_id;
ALTER TABLE ONLY public.logged_model_metrics DROP CONSTRAINT fk_logged_model_metrics_run_id;
ALTER TABLE ONLY public.logged_model_metrics DROP CONSTRAINT fk_logged_model_metrics_model_id;
ALTER TABLE ONLY public.logged_model_metrics DROP CONSTRAINT fk_logged_model_metrics_experiment_id;
ALTER TABLE ONLY public.label_schemas DROP CONSTRAINT fk_label_schemas_experiment_id;
ALTER TABLE ONLY public.issues DROP CONSTRAINT fk_issues_source_run_id;
ALTER TABLE ONLY public.issues DROP CONSTRAINT fk_issues_experiment_id;
ALTER TABLE ONLY public.guardrails DROP CONSTRAINT fk_guardrails_scorer_version;
ALTER TABLE ONLY public.guardrails DROP CONSTRAINT fk_guardrails_action_endpoint_id;
ALTER TABLE ONLY public.guardrail_configs DROP CONSTRAINT fk_guardrail_configs_guardrail_id;
ALTER TABLE ONLY public.guardrail_configs DROP CONSTRAINT fk_guardrail_configs_endpoint_id;
ALTER TABLE ONLY public.evaluation_dataset_tags DROP CONSTRAINT fk_evaluation_dataset_tags_dataset_id;
ALTER TABLE ONLY public.evaluation_dataset_records DROP CONSTRAINT fk_evaluation_dataset_records_dataset_id;
ALTER TABLE ONLY public.endpoints DROP CONSTRAINT fk_endpoints_experiment_id;
ALTER TABLE ONLY public.endpoint_tags DROP CONSTRAINT fk_endpoint_tags_endpoint_id;
ALTER TABLE ONLY public.endpoint_model_mappings DROP CONSTRAINT fk_endpoint_model_mappings_model_definition_id;
ALTER TABLE ONLY public.endpoint_model_mappings DROP CONSTRAINT fk_endpoint_model_mappings_endpoint_id;
ALTER TABLE ONLY public.endpoint_bindings DROP CONSTRAINT fk_endpoint_bindings_endpoint_id;
ALTER TABLE ONLY public.datasets DROP CONSTRAINT fk_datasets_experiment_id_experiments;
ALTER TABLE ONLY public.assessments DROP CONSTRAINT fk_assessments_trace_id;
ALTER TABLE ONLY public.experiment_tags DROP CONSTRAINT experiment_tags_experiment_id_fkey;
ALTER TABLE ONLY public.customers DROP CONSTRAINT customers_organization_id_fkey;
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT audit_logs_user_id_fkey;
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT audit_logs_organization_id_fkey;
ALTER TABLE ONLY public.api_keys DROP CONSTRAINT api_keys_organization_id_fkey;
DROP TRIGGER prevent_secrets_aad_mutation ON public.secrets;
DROP INDEX public.unique_endpoint_model_linkage_mapping;
DROP INDEX public.ix_users_id;
DROP INDEX public.ix_users_email;
DROP INDEX public.ix_prediction_history_id;
DROP INDEX public.ix_prediction_history_customer_db_id;
DROP INDEX public.ix_organizations_name;
DROP INDEX public.ix_organizations_id;
DROP INDEX public.ix_notifications_id;
DROP INDEX public.ix_models_id;
DROP INDEX public.ix_mcp_access_endpoints_version;
DROP INDEX public.ix_mcp_access_endpoints_server_name;
DROP INDEX public.ix_mcp_access_endpoints_alias;
DROP INDEX public.ix_customers_id;
DROP INDEX public.ix_customers_customer_id;
DROP INDEX public.ix_audit_logs_id;
DROP INDEX public.ix_api_keys_id;
DROP INDEX public.index_trace_tags_request_id;
DROP INDEX public.index_trace_request_metadata_request_id;
DROP INDEX public.index_trace_metrics_request_id;
DROP INDEX public.index_trace_info_experiment_id_timestamp_ms;
DROP INDEX public.index_tags_run_uuid;
DROP INDEX public.index_spans_experiment_id_type_status;
DROP INDEX public.index_spans_experiment_id_status_type;
DROP INDEX public.index_spans_experiment_id_start_time;
DROP INDEX public.index_spans_experiment_id_duration;
DROP INDEX public.index_span_metrics_trace_id_span_id;
DROP INDEX public.index_scorers_experiment_id_scorer_name;
DROP INDEX public.index_scorer_versions_scorer_id;
DROP INDEX public.index_review_queues_experiment_id;
DROP INDEX public.index_review_queue_users_user_id;
DROP INDEX public.index_review_queue_label_schemas_schema_id;
DROP INDEX public.index_review_queue_items_queue_id_status;
DROP INDEX public.index_review_queue_items_item_id;
DROP INDEX public.index_params_run_uuid;
DROP INDEX public.index_model_definitions_secret_id;
DROP INDEX public.index_model_definitions_provider;
DROP INDEX public.index_metrics_run_uuid_key_step;
DROP INDEX public.index_metrics_run_uuid;
DROP INDEX public.index_logged_model_metrics_model_id;
DROP INDEX public.index_latest_metrics_run_uuid;
DROP INDEX public.index_label_schemas_experiment_id;
DROP INDEX public.index_jobs_name_status_creation_time;
DROP INDEX public.index_issues_status;
DROP INDEX public.index_issues_source_run_id;
DROP INDEX public.index_issues_experiment_id;
DROP INDEX public.index_inputs_input_uuid;
DROP INDEX public.index_inputs_destination_type_destination_id_source_type;
DROP INDEX public.index_evaluation_datasets_name;
DROP INDEX public.index_evaluation_datasets_created_time;
DROP INDEX public.index_evaluation_dataset_tags_dataset_id;
DROP INDEX public.index_evaluation_dataset_records_dataset_id;
DROP INDEX public.index_entity_associations_reverse_lookup;
DROP INDEX public.index_entity_associations_association_id;
DROP INDEX public.index_endpoint_tags_endpoint_id;
DROP INDEX public.index_endpoint_model_mappings_model_definition_id;
DROP INDEX public.index_endpoint_model_mappings_endpoint_id;
DROP INDEX public.index_datasets_experiment_id_dataset_source_type;
DROP INDEX public.index_datasets_dataset_uuid;
DROP INDEX public.index_assessments_trace_id_created_timestamp;
DROP INDEX public.index_assessments_run_id_created_timestamp;
DROP INDEX public.index_assessments_last_updated_timestamp;
DROP INDEX public.index_assessments_assessment_type;
DROP INDEX public.idx_webhooks_workspace;
DROP INDEX public.idx_webhooks_status;
DROP INDEX public.idx_webhooks_name;
DROP INDEX public.idx_webhook_events_entity_action;
DROP INDEX public.idx_webhook_events_entity;
DROP INDEX public.idx_webhook_events_action;
DROP INDEX public.idx_secrets_workspace;
DROP INDEX public.idx_registered_models_workspace;
DROP INDEX public.idx_registered_model_tags_workspace_name;
DROP INDEX public.idx_model_version_tags_workspace_name_version;
DROP INDEX public.idx_model_definitions_workspace;
DROP INDEX public.idx_mcp_server_versions_latest;
DROP INDEX public.idx_guardrails_workspace;
DROP INDEX public.idx_guardrails_scorer;
DROP INDEX public.idx_guardrail_configs_guardrail_id;
DROP INDEX public.idx_guardrail_configs_endpoint_id;
DROP INDEX public.idx_experiments_workspace_creation_time;
DROP INDEX public.idx_experiments_workspace;
DROP INDEX public.idx_evaluation_datasets_workspace;
DROP INDEX public.idx_endpoints_workspace;
DROP INDEX public.idx_budget_policies_workspace;
DROP INDEX public.idx_budget_policies_target_value;
ALTER TABLE ONLY public.workspaces DROP CONSTRAINT workspaces_pk;
ALTER TABLE ONLY public.webhooks DROP CONSTRAINT webhook_pk;
ALTER TABLE ONLY public.webhook_events DROP CONSTRAINT webhook_event_pk;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.secrets DROP CONSTRAINT uq_secrets_workspace_secret_name;
ALTER TABLE ONLY public.review_queues DROP CONSTRAINT uq_review_queues_experiment_name_key;
ALTER TABLE ONLY public.model_definitions DROP CONSTRAINT uq_model_definitions_workspace_name;
ALTER TABLE ONLY public.label_schemas DROP CONSTRAINT uq_label_schemas_exp_name;
ALTER TABLE ONLY public.experiments DROP CONSTRAINT uq_experiments_workspace_name;
ALTER TABLE ONLY public.endpoints DROP CONSTRAINT uq_endpoints_workspace_name;
ALTER TABLE ONLY public.evaluation_dataset_records DROP CONSTRAINT unique_dataset_input;
ALTER TABLE ONLY public.trace_tags DROP CONSTRAINT trace_tag_pk;
ALTER TABLE ONLY public.trace_request_metadata DROP CONSTRAINT trace_request_metadata_pk;
ALTER TABLE ONLY public.trace_metrics DROP CONSTRAINT trace_metrics_pk;
ALTER TABLE ONLY public.trace_info DROP CONSTRAINT trace_info_pk;
ALTER TABLE ONLY public.tags DROP CONSTRAINT tag_pk;
ALTER TABLE ONLY public.spans DROP CONSTRAINT spans_pk;
ALTER TABLE ONLY public.span_metrics DROP CONSTRAINT span_metrics_pk;
ALTER TABLE ONLY public.secrets DROP CONSTRAINT secrets_pk;
ALTER TABLE ONLY public.scorer_versions DROP CONSTRAINT scorer_version_pk;
ALTER TABLE ONLY public.scorers DROP CONSTRAINT scorer_pk;
ALTER TABLE ONLY public.runs DROP CONSTRAINT run_pk;
ALTER TABLE ONLY public.review_queues DROP CONSTRAINT review_queues_pk;
ALTER TABLE ONLY public.review_queue_users DROP CONSTRAINT review_queue_users_pk;
ALTER TABLE ONLY public.review_queue_label_schemas DROP CONSTRAINT review_queue_label_schemas_pk;
ALTER TABLE ONLY public.review_queue_items DROP CONSTRAINT review_queue_items_pk;
ALTER TABLE ONLY public.registered_model_tags DROP CONSTRAINT registered_model_tag_pk;
ALTER TABLE ONLY public.registered_models DROP CONSTRAINT registered_model_pk;
ALTER TABLE ONLY public.registered_model_aliases DROP CONSTRAINT registered_model_alias_pk;
ALTER TABLE ONLY public.prediction_history DROP CONSTRAINT prediction_history_pkey;
ALTER TABLE ONLY public.params DROP CONSTRAINT param_pk;
ALTER TABLE ONLY public.organizations DROP CONSTRAINT organizations_pkey;
ALTER TABLE ONLY public.online_scoring_configs DROP CONSTRAINT online_scoring_config_pk;
ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_pkey;
ALTER TABLE ONLY public.models DROP CONSTRAINT models_pkey;
ALTER TABLE ONLY public.model_version_tags DROP CONSTRAINT model_version_tag_pk;
ALTER TABLE ONLY public.model_versions DROP CONSTRAINT model_version_pk;
ALTER TABLE ONLY public.model_definitions DROP CONSTRAINT model_definitions_pk;
ALTER TABLE ONLY public.metrics DROP CONSTRAINT metric_pk;
ALTER TABLE ONLY public.mcp_servers DROP CONSTRAINT mcp_servers_pk;
ALTER TABLE ONLY public.mcp_server_versions DROP CONSTRAINT mcp_server_versions_pk;
ALTER TABLE ONLY public.mcp_server_version_tags DROP CONSTRAINT mcp_server_version_tags_pk;
ALTER TABLE ONLY public.mcp_server_tags DROP CONSTRAINT mcp_server_tags_pk;
ALTER TABLE ONLY public.mcp_server_aliases DROP CONSTRAINT mcp_server_aliases_pk;
ALTER TABLE ONLY public.mcp_access_endpoints DROP CONSTRAINT mcp_access_endpoints_pk;
ALTER TABLE ONLY public.logged_models DROP CONSTRAINT logged_models_pk;
ALTER TABLE ONLY public.logged_model_tags DROP CONSTRAINT logged_model_tags_pk;
ALTER TABLE ONLY public.logged_model_params DROP CONSTRAINT logged_model_params_pk;
ALTER TABLE ONLY public.logged_model_metrics DROP CONSTRAINT logged_model_metrics_pk;
ALTER TABLE ONLY public.latest_metrics DROP CONSTRAINT latest_metric_pk;
ALTER TABLE ONLY public.label_schemas DROP CONSTRAINT label_schemas_pk;
ALTER TABLE ONLY public.jobs DROP CONSTRAINT jobs_pk;
ALTER TABLE ONLY public.issues DROP CONSTRAINT issues_pk;
ALTER TABLE ONLY public.inputs DROP CONSTRAINT inputs_pk;
ALTER TABLE ONLY public.input_tags DROP CONSTRAINT input_tags_pk;
ALTER TABLE ONLY public.guardrails DROP CONSTRAINT guardrails_pk;
ALTER TABLE ONLY public.guardrail_configs DROP CONSTRAINT guardrail_configs_pk;
ALTER TABLE ONLY public.experiment_tags DROP CONSTRAINT experiment_tag_pk;
ALTER TABLE ONLY public.experiments DROP CONSTRAINT experiment_pk;
ALTER TABLE ONLY public.evaluation_datasets DROP CONSTRAINT evaluation_datasets_pk;
ALTER TABLE ONLY public.evaluation_dataset_tags DROP CONSTRAINT evaluation_dataset_tags_pk;
ALTER TABLE ONLY public.evaluation_dataset_records DROP CONSTRAINT evaluation_dataset_records_pk;
ALTER TABLE ONLY public.entity_associations DROP CONSTRAINT entity_associations_pk;
ALTER TABLE ONLY public.endpoints DROP CONSTRAINT endpoints_pk;
ALTER TABLE ONLY public.endpoint_tags DROP CONSTRAINT endpoint_tag_pk;
ALTER TABLE ONLY public.endpoint_model_mappings DROP CONSTRAINT endpoint_model_mappings_pk;
ALTER TABLE ONLY public.endpoint_bindings DROP CONSTRAINT endpoint_bindings_pk;
ALTER TABLE ONLY public.datasets DROP CONSTRAINT dataset_pk;
ALTER TABLE ONLY public.customers DROP CONSTRAINT customers_pkey;
ALTER TABLE ONLY public.budget_policies DROP CONSTRAINT budget_policies_pk;
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT audit_logs_pkey;
ALTER TABLE ONLY public.assessments DROP CONSTRAINT assessments_pk;
ALTER TABLE ONLY public.api_keys DROP CONSTRAINT api_keys_pkey;
ALTER TABLE ONLY public.alembic_version DROP CONSTRAINT alembic_version_pkc;
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.prediction_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.organizations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.models ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.experiments ALTER COLUMN experiment_id DROP DEFAULT;
ALTER TABLE public.customers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.api_keys ALTER COLUMN id DROP DEFAULT;
DROP TABLE public.workspaces;
DROP TABLE public.webhooks;
DROP TABLE public.webhook_events;
DROP SEQUENCE public.users_id_seq;
DROP TABLE public.users;
DROP TABLE public.trace_tags;
DROP TABLE public.trace_request_metadata;
DROP TABLE public.trace_metrics;
DROP TABLE public.trace_info;
DROP TABLE public.tags;
DROP TABLE public.spans;
DROP TABLE public.span_metrics;
DROP TABLE public.secrets;
DROP TABLE public.scorers;
DROP TABLE public.scorer_versions;
DROP TABLE public.runs;
DROP TABLE public.review_queues;
DROP TABLE public.review_queue_users;
DROP TABLE public.review_queue_label_schemas;
DROP TABLE public.review_queue_items;
DROP TABLE public.registered_models;
DROP TABLE public.registered_model_tags;
DROP TABLE public.registered_model_aliases;
DROP SEQUENCE public.prediction_history_id_seq;
DROP TABLE public.prediction_history;
DROP TABLE public.params;
DROP SEQUENCE public.organizations_id_seq;
DROP TABLE public.organizations;
DROP TABLE public.online_scoring_configs;
DROP SEQUENCE public.notifications_id_seq;
DROP TABLE public.notifications;
DROP SEQUENCE public.models_id_seq;
DROP TABLE public.models;
DROP TABLE public.model_versions;
DROP TABLE public.model_version_tags;
DROP TABLE public.model_definitions;
DROP TABLE public.metrics;
DROP TABLE public.mcp_servers;
DROP TABLE public.mcp_server_versions;
DROP TABLE public.mcp_server_version_tags;
DROP TABLE public.mcp_server_tags;
DROP TABLE public.mcp_server_aliases;
DROP TABLE public.mcp_access_endpoints;
DROP TABLE public.logged_models;
DROP TABLE public.logged_model_tags;
DROP TABLE public.logged_model_params;
DROP TABLE public.logged_model_metrics;
DROP TABLE public.latest_metrics;
DROP TABLE public.label_schemas;
DROP TABLE public.jobs;
DROP TABLE public.issues;
DROP TABLE public.inputs;
DROP TABLE public.input_tags;
DROP TABLE public.guardrails;
DROP TABLE public.guardrail_configs;
DROP SEQUENCE public.experiments_experiment_id_seq;
DROP TABLE public.experiments;
DROP TABLE public.experiment_tags;
DROP TABLE public.evaluation_datasets;
DROP TABLE public.evaluation_dataset_tags;
DROP TABLE public.evaluation_dataset_records;
DROP TABLE public.entity_associations;
DROP TABLE public.endpoints;
DROP TABLE public.endpoint_tags;
DROP TABLE public.endpoint_model_mappings;
DROP TABLE public.endpoint_bindings;
DROP TABLE public.datasets;
DROP SEQUENCE public.customers_id_seq;
DROP TABLE public.customers;
DROP TABLE public.budget_policies;
DROP SEQUENCE public.audit_logs_id_seq;
DROP TABLE public.audit_logs;
DROP TABLE public.assessments;
DROP SEQUENCE public.api_keys_id_seq;
DROP TABLE public.api_keys;
DROP TABLE public.alembic_version;
DROP FUNCTION public.prevent_secrets_aad_mutation();
DROP TYPE public.roleenum;
--
-- Name: roleenum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.roleenum AS ENUM (
    'SUPER_ADMIN',
    'ORG_ADMIN',
    'DATA_ANALYST',
    'VIEWER'
);


ALTER TYPE public.roleenum OWNER TO postgres;

--
-- Name: prevent_secrets_aad_mutation(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.prevent_secrets_aad_mutation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.secret_id != NEW.secret_id OR OLD.secret_name != NEW.secret_name THEN
        RAISE EXCEPTION 'secret_id and secret_name are immutable (used as AAD in encryption)';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.prevent_secrets_aad_mutation() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_keys (
    id integer NOT NULL,
    organization_id integer,
    name character varying NOT NULL,
    key_hash character varying NOT NULL,
    preview character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.api_keys OWNER TO postgres;

--
-- Name: api_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.api_keys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.api_keys_id_seq OWNER TO postgres;

--
-- Name: api_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.api_keys_id_seq OWNED BY public.api_keys.id;


--
-- Name: assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessments (
    assessment_id character varying(50) NOT NULL,
    trace_id character varying(50) NOT NULL,
    name character varying(250) NOT NULL,
    assessment_type character varying(20) NOT NULL,
    value text NOT NULL,
    error text,
    created_timestamp bigint NOT NULL,
    last_updated_timestamp bigint NOT NULL,
    source_type character varying(50) NOT NULL,
    source_id character varying(250),
    run_id character varying(32),
    span_id character varying(50),
    rationale text,
    overrides character varying(50),
    valid boolean NOT NULL,
    assessment_metadata text
);


ALTER TABLE public.assessments OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying NOT NULL,
    endpoint character varying,
    details json,
    ip_address character varying,
    created_at timestamp with time zone DEFAULT now(),
    organization_id integer
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: budget_policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_policies (
    budget_policy_id character varying(36) NOT NULL,
    budget_unit character varying(32) NOT NULL,
    budget_amount double precision NOT NULL,
    duration_unit character varying(32) NOT NULL,
    duration_value integer NOT NULL,
    target_scope character varying(32) NOT NULL,
    budget_action character varying(32) NOT NULL,
    created_by character varying(255),
    created_at bigint NOT NULL,
    last_updated_by character varying(255),
    last_updated_at bigint NOT NULL,
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL,
    target_value character varying(255)
);


ALTER TABLE public.budget_policies OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    customer_id character varying NOT NULL,
    organization_id integer NOT NULL,
    age integer,
    tenure_months integer,
    num_products integer,
    has_credit_card integer,
    is_active_member integer,
    avg_balance double precision,
    monthly_transactions integer,
    support_tickets_last_90d integer,
    balance_trend_pct double precision,
    days_since_last_login integer,
    salary_band character varying,
    channel character varying,
    churned integer,
    created_at timestamp with time zone DEFAULT now(),
    geography character varying
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: datasets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.datasets (
    dataset_uuid character varying(36) NOT NULL,
    experiment_id integer NOT NULL,
    name character varying(500) NOT NULL,
    digest character varying(36) NOT NULL,
    dataset_source_type character varying(36) NOT NULL,
    dataset_source text NOT NULL,
    dataset_schema text,
    dataset_profile text
);


ALTER TABLE public.datasets OWNER TO postgres;

--
-- Name: endpoint_bindings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.endpoint_bindings (
    endpoint_id character varying(36) NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_id character varying(255) NOT NULL,
    created_at bigint NOT NULL,
    created_by character varying(255),
    last_updated_at bigint NOT NULL,
    last_updated_by character varying(255),
    display_name character varying(255)
);


ALTER TABLE public.endpoint_bindings OWNER TO postgres;

--
-- Name: endpoint_model_mappings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.endpoint_model_mappings (
    mapping_id character varying(36) NOT NULL,
    endpoint_id character varying(36) NOT NULL,
    model_definition_id character varying(36) NOT NULL,
    weight double precision NOT NULL,
    created_by character varying(255),
    created_at bigint NOT NULL,
    linkage_type character varying(64) DEFAULT 'PRIMARY'::character varying NOT NULL,
    fallback_order integer
);


ALTER TABLE public.endpoint_model_mappings OWNER TO postgres;

--
-- Name: endpoint_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.endpoint_tags (
    key character varying(250) NOT NULL,
    value character varying(5000),
    endpoint_id character varying(36) NOT NULL
);


ALTER TABLE public.endpoint_tags OWNER TO postgres;

--
-- Name: endpoints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.endpoints (
    endpoint_id character varying(36) NOT NULL,
    name character varying(255),
    created_by character varying(255),
    created_at bigint NOT NULL,
    last_updated_by character varying(255),
    last_updated_at bigint NOT NULL,
    routing_strategy character varying(64),
    fallback_config_json text,
    experiment_id integer,
    usage_tracking boolean DEFAULT false NOT NULL,
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.endpoints OWNER TO postgres;

--
-- Name: entity_associations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entity_associations (
    association_id character varying(36) NOT NULL,
    source_type character varying(36) NOT NULL,
    source_id character varying(36) NOT NULL,
    destination_type character varying(36) NOT NULL,
    destination_id character varying(36) NOT NULL,
    created_time bigint
);


ALTER TABLE public.entity_associations OWNER TO postgres;

--
-- Name: evaluation_dataset_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluation_dataset_records (
    dataset_record_id character varying(36) NOT NULL,
    dataset_id character varying(36) NOT NULL,
    inputs json NOT NULL,
    expectations json,
    tags json,
    source json,
    source_id character varying(36),
    source_type character varying(255),
    created_time bigint,
    last_update_time bigint,
    created_by character varying(255),
    last_updated_by character varying(255),
    input_hash character varying(64) NOT NULL,
    outputs json
);


ALTER TABLE public.evaluation_dataset_records OWNER TO postgres;

--
-- Name: evaluation_dataset_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluation_dataset_tags (
    dataset_id character varying(36) NOT NULL,
    key character varying(255) NOT NULL,
    value character varying(5000)
);


ALTER TABLE public.evaluation_dataset_tags OWNER TO postgres;

--
-- Name: evaluation_datasets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluation_datasets (
    dataset_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    schema text,
    profile text,
    digest character varying(64),
    created_time bigint,
    last_update_time bigint,
    created_by character varying(255),
    last_updated_by character varying(255),
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.evaluation_datasets OWNER TO postgres;

--
-- Name: experiment_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.experiment_tags (
    key character varying(250) NOT NULL,
    value character varying(5000),
    experiment_id integer NOT NULL
);


ALTER TABLE public.experiment_tags OWNER TO postgres;

--
-- Name: experiments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.experiments (
    experiment_id integer NOT NULL,
    name character varying(256) NOT NULL,
    artifact_location character varying(256),
    lifecycle_stage character varying(32),
    creation_time bigint,
    last_update_time bigint,
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL,
    CONSTRAINT experiments_lifecycle_stage CHECK (((lifecycle_stage)::text = ANY ((ARRAY['active'::character varying, 'deleted'::character varying])::text[])))
);


ALTER TABLE public.experiments OWNER TO postgres;

--
-- Name: experiments_experiment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.experiments_experiment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.experiments_experiment_id_seq OWNER TO postgres;

--
-- Name: experiments_experiment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.experiments_experiment_id_seq OWNED BY public.experiments.experiment_id;


--
-- Name: guardrail_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guardrail_configs (
    endpoint_id character varying(36) NOT NULL,
    guardrail_id character varying(36) NOT NULL,
    execution_order integer,
    created_by character varying(255),
    created_at bigint NOT NULL,
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.guardrail_configs OWNER TO postgres;

--
-- Name: guardrails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guardrails (
    guardrail_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    scorer_id character varying(36) NOT NULL,
    scorer_version integer NOT NULL,
    stage character varying(32) NOT NULL,
    action character varying(32) NOT NULL,
    action_endpoint_id character varying(36),
    created_by character varying(255),
    created_at bigint NOT NULL,
    last_updated_by character varying(255),
    last_updated_at bigint NOT NULL,
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.guardrails OWNER TO postgres;

--
-- Name: input_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.input_tags (
    input_uuid character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(500) NOT NULL
);


ALTER TABLE public.input_tags OWNER TO postgres;

--
-- Name: inputs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inputs (
    input_uuid character varying(36) NOT NULL,
    source_type character varying(36) NOT NULL,
    source_id character varying(36) NOT NULL,
    destination_type character varying(36) NOT NULL,
    destination_id character varying(36) NOT NULL,
    step bigint DEFAULT '0'::bigint NOT NULL
);


ALTER TABLE public.inputs OWNER TO postgres;

--
-- Name: issues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.issues (
    issue_id character varying(36) NOT NULL,
    experiment_id integer NOT NULL,
    name character varying(250) NOT NULL,
    description text NOT NULL,
    status character varying(50) NOT NULL,
    severity character varying(50),
    root_causes text,
    source_run_id character varying(32),
    categories text,
    created_timestamp bigint NOT NULL,
    last_updated_timestamp bigint NOT NULL,
    created_by character varying(255)
);


ALTER TABLE public.issues OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id character varying(36) NOT NULL,
    creation_time bigint NOT NULL,
    job_name character varying(500) NOT NULL,
    params text NOT NULL,
    timeout double precision,
    status integer NOT NULL,
    result text,
    retry_count integer NOT NULL,
    last_update_time bigint NOT NULL,
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL,
    status_details json
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: label_schemas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.label_schemas (
    schema_id character varying(36) NOT NULL,
    experiment_id integer NOT NULL,
    name character varying(250) NOT NULL,
    type character varying(16) NOT NULL,
    instruction text,
    enable_comment boolean DEFAULT false NOT NULL,
    input_type character varying(32) NOT NULL,
    input_config text NOT NULL,
    created_by character varying(255),
    created_time bigint NOT NULL,
    last_update_time bigint NOT NULL,
    is_default boolean DEFAULT false NOT NULL
);


ALTER TABLE public.label_schemas OWNER TO postgres;

--
-- Name: latest_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.latest_metrics (
    key character varying(250) NOT NULL,
    value double precision NOT NULL,
    "timestamp" bigint,
    step bigint NOT NULL,
    is_nan boolean NOT NULL,
    run_uuid character varying(32) NOT NULL
);


ALTER TABLE public.latest_metrics OWNER TO postgres;

--
-- Name: logged_model_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logged_model_metrics (
    model_id character varying(36) NOT NULL,
    metric_name character varying(500) NOT NULL,
    metric_timestamp_ms bigint NOT NULL,
    metric_step bigint NOT NULL,
    metric_value double precision,
    experiment_id integer NOT NULL,
    run_id character varying(32) NOT NULL,
    dataset_uuid character varying(36),
    dataset_name character varying(500),
    dataset_digest character varying(36)
);


ALTER TABLE public.logged_model_metrics OWNER TO postgres;

--
-- Name: logged_model_params; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logged_model_params (
    model_id character varying(36) NOT NULL,
    experiment_id integer NOT NULL,
    param_key character varying(255) NOT NULL,
    param_value text NOT NULL
);


ALTER TABLE public.logged_model_params OWNER TO postgres;

--
-- Name: logged_model_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logged_model_tags (
    model_id character varying(36) NOT NULL,
    experiment_id integer NOT NULL,
    tag_key character varying(255) NOT NULL,
    tag_value text NOT NULL
);


ALTER TABLE public.logged_model_tags OWNER TO postgres;

--
-- Name: logged_models; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logged_models (
    model_id character varying(36) NOT NULL,
    experiment_id integer NOT NULL,
    name character varying(500) NOT NULL,
    artifact_location character varying(1000) NOT NULL,
    creation_timestamp_ms bigint NOT NULL,
    last_updated_timestamp_ms bigint NOT NULL,
    status integer NOT NULL,
    lifecycle_stage character varying(32),
    model_type character varying(500),
    source_run_id character varying(32),
    status_message character varying(1000),
    CONSTRAINT logged_models_lifecycle_stage_check CHECK (((lifecycle_stage)::text = ANY ((ARRAY['active'::character varying, 'deleted'::character varying])::text[])))
);


ALTER TABLE public.logged_models OWNER TO postgres;

--
-- Name: mcp_access_endpoints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mcp_access_endpoints (
    id character varying(36) NOT NULL,
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL,
    server_name character varying(256) NOT NULL,
    server_version character varying(128),
    server_alias character varying(256),
    url character varying(2048) NOT NULL,
    transport_type character varying(32) DEFAULT 'streamable-http'::character varying NOT NULL,
    created_by character varying(256),
    last_updated_by character varying(256),
    created_at bigint NOT NULL,
    last_updated_at bigint NOT NULL
);


ALTER TABLE public.mcp_access_endpoints OWNER TO postgres;

--
-- Name: mcp_server_aliases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mcp_server_aliases (
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL,
    name character varying(256) NOT NULL,
    alias character varying(256) NOT NULL,
    version character varying(128) NOT NULL
);


ALTER TABLE public.mcp_server_aliases OWNER TO postgres;

--
-- Name: mcp_server_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mcp_server_tags (
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL,
    name character varying(256) NOT NULL,
    key character varying(250) NOT NULL,
    value character varying(5000)
);


ALTER TABLE public.mcp_server_tags OWNER TO postgres;

--
-- Name: mcp_server_version_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mcp_server_version_tags (
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL,
    name character varying(256) NOT NULL,
    version character varying(128) NOT NULL,
    key character varying(250) NOT NULL,
    value character varying(5000)
);


ALTER TABLE public.mcp_server_version_tags OWNER TO postgres;

--
-- Name: mcp_server_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mcp_server_versions (
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL,
    name character varying(256) NOT NULL,
    version character varying(128) NOT NULL,
    version_major integer NOT NULL,
    version_minor integer NOT NULL,
    version_patch integer NOT NULL,
    version_prerelease_sort_key character varying(512) NOT NULL,
    server_json json NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    tools json,
    source character varying(512),
    connect_options json,
    created_by character varying(256),
    last_updated_by character varying(256),
    created_at bigint NOT NULL,
    last_updated_at bigint NOT NULL
);


ALTER TABLE public.mcp_server_versions OWNER TO postgres;

--
-- Name: mcp_servers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mcp_servers (
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL,
    name character varying(256) NOT NULL,
    display_name character varying(256),
    description text,
    icons json,
    created_by character varying(256),
    last_updated_by character varying(256),
    created_at bigint NOT NULL,
    last_updated_at bigint NOT NULL
);


ALTER TABLE public.mcp_servers OWNER TO postgres;

--
-- Name: metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metrics (
    key character varying(250) NOT NULL,
    value double precision NOT NULL,
    "timestamp" bigint NOT NULL,
    run_uuid character varying(32) NOT NULL,
    step bigint DEFAULT '0'::bigint NOT NULL,
    is_nan boolean DEFAULT false NOT NULL
);


ALTER TABLE public.metrics OWNER TO postgres;

--
-- Name: model_definitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_definitions (
    model_definition_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    secret_id character varying(36),
    provider character varying(64) NOT NULL,
    model_name character varying(256) NOT NULL,
    created_by character varying(255),
    created_at bigint NOT NULL,
    last_updated_by character varying(255),
    last_updated_at bigint NOT NULL,
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.model_definitions OWNER TO postgres;

--
-- Name: model_version_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_version_tags (
    key character varying(250) NOT NULL,
    value text,
    name character varying(256) NOT NULL,
    version integer NOT NULL,
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.model_version_tags OWNER TO postgres;

--
-- Name: model_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_versions (
    name character varying(256) NOT NULL,
    version integer NOT NULL,
    creation_time bigint,
    last_updated_time bigint,
    description character varying(5000),
    user_id character varying(256),
    current_stage character varying(20),
    source character varying(500),
    run_id character varying(32),
    status character varying(20),
    status_message character varying(500),
    run_link character varying(500),
    storage_location character varying(500),
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.model_versions OWNER TO postgres;

--
-- Name: models; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.models (
    id integer NOT NULL,
    organization_id integer,
    name character varying NOT NULL,
    version character varying NOT NULL,
    model_type character varying NOT NULL,
    metrics json,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.models OWNER TO postgres;

--
-- Name: models_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.models_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.models_id_seq OWNER TO postgres;

--
-- Name: models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.models_id_seq OWNED BY public.models.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    title character varying NOT NULL,
    message character varying NOT NULL,
    type character varying NOT NULL,
    is_read boolean,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: online_scoring_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.online_scoring_configs (
    online_scoring_config_id character varying(36) NOT NULL,
    scorer_id character varying(36) NOT NULL,
    sample_rate double precision NOT NULL,
    experiment_id integer NOT NULL,
    filter_string text
);


ALTER TABLE public.online_scoring_configs OWNER TO postgres;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    name character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    require_2fa boolean DEFAULT false,
    session_timeout character varying DEFAULT '15 Minutes'::character varying
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizations_id_seq OWNER TO postgres;

--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: params; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.params (
    key character varying(250) NOT NULL,
    value character varying(8000) NOT NULL,
    run_uuid character varying(32) NOT NULL
);


ALTER TABLE public.params OWNER TO postgres;

--
-- Name: prediction_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prediction_history (
    id integer NOT NULL,
    customer_db_id integer NOT NULL,
    model_id integer NOT NULL,
    probability double precision NOT NULL,
    prediction integer NOT NULL,
    risk_tier character varying NOT NULL,
    top_factors json,
    created_at timestamp with time zone DEFAULT now(),
    llm_strategy json
);


ALTER TABLE public.prediction_history OWNER TO postgres;

--
-- Name: prediction_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prediction_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prediction_history_id_seq OWNER TO postgres;

--
-- Name: prediction_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prediction_history_id_seq OWNED BY public.prediction_history.id;


--
-- Name: registered_model_aliases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registered_model_aliases (
    alias character varying(256) NOT NULL,
    version integer NOT NULL,
    name character varying(256) NOT NULL,
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.registered_model_aliases OWNER TO postgres;

--
-- Name: registered_model_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registered_model_tags (
    key character varying(250) NOT NULL,
    value character varying(5000),
    name character varying(256) NOT NULL,
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.registered_model_tags OWNER TO postgres;

--
-- Name: registered_models; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registered_models (
    name character varying(256) NOT NULL,
    creation_time bigint,
    last_updated_time bigint,
    description character varying(5000),
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.registered_models OWNER TO postgres;

--
-- Name: review_queue_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_queue_items (
    queue_id character varying(36) NOT NULL,
    item_type character varying(16) NOT NULL,
    item_id character varying(50) NOT NULL,
    status character varying(16) NOT NULL,
    completed_by character varying(250),
    completed_time_ms bigint,
    creation_time_ms bigint NOT NULL,
    last_update_time_ms bigint NOT NULL
);


ALTER TABLE public.review_queue_items OWNER TO postgres;

--
-- Name: review_queue_label_schemas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_queue_label_schemas (
    queue_id character varying(36) NOT NULL,
    schema_id character varying(36) NOT NULL
);


ALTER TABLE public.review_queue_label_schemas OWNER TO postgres;

--
-- Name: review_queue_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_queue_users (
    queue_id character varying(36) NOT NULL,
    user_id character varying(250) NOT NULL
);


ALTER TABLE public.review_queue_users OWNER TO postgres;

--
-- Name: review_queues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_queues (
    queue_id character varying(36) NOT NULL,
    experiment_id integer NOT NULL,
    name character varying(250) NOT NULL,
    queue_type character varying(16) NOT NULL,
    created_by character varying(255),
    creation_time_ms bigint NOT NULL,
    last_update_time_ms bigint NOT NULL,
    name_key character varying(250) NOT NULL
);


ALTER TABLE public.review_queues OWNER TO postgres;

--
-- Name: runs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.runs (
    run_uuid character varying(32) NOT NULL,
    name character varying(250),
    source_type character varying(20),
    source_name character varying(500),
    entry_point_name character varying(50),
    user_id character varying(256),
    status character varying(9),
    start_time bigint,
    end_time bigint,
    source_version character varying(50),
    lifecycle_stage character varying(20),
    artifact_uri character varying(200),
    experiment_id integer,
    deleted_time bigint,
    CONSTRAINT runs_lifecycle_stage CHECK (((lifecycle_stage)::text = ANY ((ARRAY['active'::character varying, 'deleted'::character varying])::text[]))),
    CONSTRAINT runs_status_check CHECK (((status)::text = ANY ((ARRAY['SCHEDULED'::character varying, 'FAILED'::character varying, 'FINISHED'::character varying, 'RUNNING'::character varying, 'KILLED'::character varying])::text[]))),
    CONSTRAINT source_type CHECK (((source_type)::text = ANY ((ARRAY['NOTEBOOK'::character varying, 'JOB'::character varying, 'LOCAL'::character varying, 'UNKNOWN'::character varying, 'PROJECT'::character varying])::text[])))
);


ALTER TABLE public.runs OWNER TO postgres;

--
-- Name: scorer_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scorer_versions (
    scorer_id character varying(36) NOT NULL,
    scorer_version integer NOT NULL,
    serialized_scorer text NOT NULL,
    creation_time bigint
);


ALTER TABLE public.scorer_versions OWNER TO postgres;

--
-- Name: scorers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scorers (
    experiment_id integer NOT NULL,
    scorer_name character varying(256) NOT NULL,
    scorer_id character varying(36) NOT NULL
);


ALTER TABLE public.scorers OWNER TO postgres;

--
-- Name: secrets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.secrets (
    secret_id character varying(36) NOT NULL,
    secret_name character varying(255) NOT NULL,
    encrypted_value bytea NOT NULL,
    wrapped_dek bytea NOT NULL,
    kek_version integer NOT NULL,
    masked_value character varying(500) NOT NULL,
    provider character varying(64),
    auth_config text,
    description text,
    created_by character varying(255),
    created_at bigint NOT NULL,
    last_updated_by character varying(255),
    last_updated_at bigint NOT NULL,
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.secrets OWNER TO postgres;

--
-- Name: span_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.span_metrics (
    trace_id character varying(50) NOT NULL,
    span_id character varying(50) NOT NULL,
    key character varying(250) NOT NULL,
    value double precision
);


ALTER TABLE public.span_metrics OWNER TO postgres;

--
-- Name: spans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spans (
    trace_id character varying(50) NOT NULL,
    experiment_id integer NOT NULL,
    span_id character varying(50) NOT NULL,
    parent_span_id character varying(50),
    name text,
    type character varying(500),
    status character varying(50) NOT NULL,
    start_time_unix_nano bigint NOT NULL,
    end_time_unix_nano bigint,
    duration_ns bigint GENERATED ALWAYS AS ((end_time_unix_nano - start_time_unix_nano)) STORED,
    content text NOT NULL,
    dimension_attributes json
);


ALTER TABLE public.spans OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    key character varying(250) NOT NULL,
    value character varying(8000),
    run_uuid character varying(32) NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: trace_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trace_info (
    request_id character varying(50) NOT NULL,
    experiment_id integer NOT NULL,
    timestamp_ms bigint NOT NULL,
    execution_time_ms bigint,
    status character varying(50) NOT NULL,
    client_request_id character varying(50),
    request_preview character varying(1000),
    response_preview character varying(1000),
    db_payload_generation integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.trace_info OWNER TO postgres;

--
-- Name: trace_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trace_metrics (
    request_id character varying(50) NOT NULL,
    key character varying(250) NOT NULL,
    value double precision
);


ALTER TABLE public.trace_metrics OWNER TO postgres;

--
-- Name: trace_request_metadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trace_request_metadata (
    key character varying(250) NOT NULL,
    value character varying(8000),
    request_id character varying(50) NOT NULL
);


ALTER TABLE public.trace_request_metadata OWNER TO postgres;

--
-- Name: trace_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trace_tags (
    key character varying(250) NOT NULL,
    value character varying(8000),
    request_id character varying(50) NOT NULL
);


ALTER TABLE public.trace_tags OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying NOT NULL,
    hashed_password character varying NOT NULL,
    full_name character varying,
    is_active boolean,
    role public.roleenum NOT NULL,
    organization_id integer,
    created_at timestamp with time zone DEFAULT now(),
    profile_picture_url character varying,
    two_factor_code character varying,
    two_factor_expires_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: webhook_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.webhook_events (
    webhook_id character varying(256) NOT NULL,
    entity character varying(50) NOT NULL,
    action character varying(50) NOT NULL
);


ALTER TABLE public.webhook_events OWNER TO postgres;

--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.webhooks (
    webhook_id character varying(256) NOT NULL,
    name character varying(256) NOT NULL,
    description character varying(1000),
    url character varying(500) NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    secret character varying(1000),
    creation_timestamp bigint,
    last_updated_timestamp bigint,
    deleted_timestamp bigint,
    workspace character varying(63) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.webhooks OWNER TO postgres;

--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workspaces (
    name character varying(63) NOT NULL,
    description text,
    default_artifact_root text,
    trace_archival_location text,
    trace_archival_retention character varying(32)
);


ALTER TABLE public.workspaces OWNER TO postgres;

--
-- Name: api_keys id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_keys ALTER COLUMN id SET DEFAULT nextval('public.api_keys_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: experiments experiment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiments ALTER COLUMN experiment_id SET DEFAULT nextval('public.experiments_experiment_id_seq'::regclass);


--
-- Name: models id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.models ALTER COLUMN id SET DEFAULT nextval('public.models_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: prediction_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prediction_history ALTER COLUMN id SET DEFAULT nextval('public.prediction_history_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
36c06bca2447
\.


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.api_keys (id, organization_id, name, key_hash, preview, created_at) FROM stdin;
\.


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessments (assessment_id, trace_id, name, assessment_type, value, error, created_timestamp, last_updated_timestamp, source_type, source_id, run_id, span_id, rationale, overrides, valid, assessment_metadata) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, endpoint, details, ip_address, created_at, organization_id) FROM stdin;
1	3	Wipe Organization Data	/api/v1/organizations/me/data	\N	127.0.0.1	2026-08-26 12:51:55.413733+00	\N
2	1	Wipe Organization Data	/api/v1/organizations/me/data	\N	127.0.0.1	2026-08-26 12:58:16.151259+00	\N
3	3	Batch Prediction CSV	/api/v1/predict/batch/csv	\N	127.0.0.1	2026-08-31 05:48:37.441195+00	\N
4	3	Batch Prediction CSV	/api/v1/predict/batch/csv	\N	127.0.0.1	2026-08-31 05:48:51.539442+00	\N
5	3	Batch Prediction CSV	/api/v1/predict/batch/csv	\N	127.0.0.1	2026-08-31 05:53:36.069294+00	\N
6	1	Batch Prediction CSV	/api/v1/predict/batch/csv	\N	127.0.0.1	2026-08-31 05:54:35.156171+00	\N
7	1	Batch Prediction CSV	/api/v1/predict/batch/csv	\N	127.0.0.1	2026-08-31 05:55:15.845926+00	\N
8	3	Batch Prediction CSV	/api/v1/predict/batch/csv	\N	127.0.0.1	2026-08-31 05:57:20.174782+00	\N
9	3	Batch Prediction CSV	/api/v1/predict/batch/csv	\N	127.0.0.1	2026-08-31 05:57:49.523319+00	\N
10	1	Batch Prediction CSV	/api/v1/predict/batch/csv	\N	127.0.0.1	2026-08-31 06:00:52.80674+00	\N
11	3	Wipe Organization Data	/api/v1/organizations/me/data	\N	127.0.0.1	2026-08-31 06:03:23.602119+00	\N
12	3	Batch Prediction CSV	/api/v1/predict/batch/csv	\N	127.0.0.1	2026-08-31 06:03:32.745011+00	\N
13	3	Wipe Organization Data	/api/v1/organizations/me/data	\N	127.0.0.1	2026-08-31 06:32:01.733416+00	\N
14	3	Batch Prediction CSV	/api/v1/predict/batch/csv	\N	127.0.0.1	2026-08-31 06:32:11.420172+00	\N
15	3	Wipe Organization Data	/api/v1/organizations/me/data	\N	127.0.0.1	2026-08-31 06:54:26.827069+00	\N
16	3	Batch Prediction CSV	/api/v1/predict/batch/csv	\N	127.0.0.1	2026-08-31 06:54:43.333877+00	\N
17	3	Wipe Organization Data	/api/v1/organizations/me/data	\N	127.0.0.1	2026-08-31 09:03:21.255193+00	\N
18	3	Batch Prediction CSV	/api/v1/predict/batch/csv	\N	127.0.0.1	2026-08-31 09:22:59.572581+00	\N
19	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 10:22:53.911817+00	\N
20	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 10:23:09.328077+00	\N
21	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 10:27:15.682802+00	\N
22	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 10:27:31.764887+00	\N
23	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 10:27:57.984097+00	\N
24	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 10:28:13.415805+00	\N
25	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 10:28:29.855074+00	\N
26	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 10:56:46.887738+00	\N
27	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 10:56:58.33437+00	\N
28	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 10:59:59.144026+00	\N
29	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:00:41.094747+00	\N
30	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:00:55.74179+00	\N
31	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:01:43.183326+00	\N
32	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:02:48.321157+00	\N
33	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:08:57.41352+00	\N
34	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:09:17.937425+00	\N
35	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:09:29.038043+00	\N
36	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:10:02.044356+00	\N
37	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:10:21.866781+00	\N
38	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:24:47.83711+00	\N
39	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:37:11.067756+00	\N
40	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:39:28.95623+00	\N
41	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:44:49.755645+00	\N
42	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:45:46.193967+00	\N
43	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:46:34.416193+00	\N
44	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:47:19.655132+00	\N
45	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-08-31 11:51:14.95028+00	\N
46	1	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-09-01 05:53:37.600738+00	\N
47	1	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-09-01 05:55:33.504022+00	\N
48	1	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-09-01 06:12:21.093293+00	\N
49	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 06:55:07.70841+00	\N
50	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 06:55:13.106907+00	\N
51	3	Generated LLM Strategy for 15781477	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 06:55:14.017783+00	\N
52	3	Generated LLM Strategy for 15808044	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 06:55:15.745264+00	\N
53	3	Generated LLM Strategy for 15641175	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 06:55:16.867668+00	\N
54	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 07:02:10.053073+00	\N
55	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 07:02:14.602153+00	\N
56	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 07:03:36.086602+00	\N
57	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 07:04:44.70182+00	\N
58	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 07:05:27.003965+00	\N
59	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 07:05:27.823764+00	\N
60	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 07:05:29.693181+00	\N
61	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 07:30:06.26995+00	\N
62	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 07:31:46.379062+00	\N
63	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 07:31:47.185509+00	\N
64	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 07:31:47.66645+00	\N
65	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 07:31:47.843314+00	\N
66	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 07:31:50.393838+00	\N
67	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:24:16.242955+00	\N
68	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:24:18.087994+00	\N
69	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:24:18.943858+00	\N
70	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:26:08.073161+00	\N
71	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:26:08.940777+00	\N
72	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:29:53.986345+00	\N
73	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:30:02.099662+00	\N
74	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:30:49.288208+00	\N
75	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:32:07.194875+00	\N
76	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:33:57.04063+00	\N
77	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:34:46.593383+00	\N
78	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:35:28.209017+00	\N
79	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:37:20.92319+00	\N
80	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:44:39.180717+00	\N
81	3	Generated LLM Strategy for 15781477	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-01 08:44:43.490178+00	\N
82	3	CREATE_JIRA_TICKET	/integrations/jira/15796764	{"customer_id": "15796764", "ticket_id": "CG-6768F3"}	127.0.0.1	2026-09-01 08:45:38.961653+00	2
83	3	TRIGGER_HUBSPOT_WORKFLOW	/integrations/hubspot/15796764	{"customer_id": "15796764", "workflow_id": "WF-8601E4"}	127.0.0.1	2026-09-01 08:45:55.148636+00	2
84	3	CREATE_JIRA_TICKET	/integrations/jira/15796764	{"customer_id": "15796764", "ticket_id": "KAN-7546A9"}	127.0.0.1	2026-09-01 08:51:55.547503+00	2
85	3	CREATE_JIRA_TICKET	/integrations/jira/15796764	{"customer_id": "15796764", "ticket_id": "KAN-BBC9EF"}	127.0.0.1	2026-09-01 10:19:44.356674+00	2
86	3	TRIGGER_HUBSPOT_WORKFLOW	/integrations/hubspot/15796764	{"customer_id": "15796764", "workflow_id": "WF-87F759"}	127.0.0.1	2026-09-02 06:02:08.62009+00	2
87	3	Generated LLM Strategy for 15796764	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-02 06:10:14.857248+00	\N
88	3	Generated LLM Strategy for 15641175	/api/v1/predict/strategy	\N	127.0.0.1	2026-09-02 06:10:18.940519+00	\N
89	1	Updated Security Settings	/api/v1/organizations/me/settings	\N	127.0.0.1	2026-09-07 07:10:56.967151+00	\N
90	1	Updated Security Settings	/api/v1/organizations/me/settings	\N	127.0.0.1	2026-09-07 07:10:59.682382+00	\N
91	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-09-07 08:53:27.594961+00	\N
92	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-09-07 08:53:33.593605+00	\N
93	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-09-07 09:00:32.919653+00	\N
94	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-09-07 09:07:07.753585+00	\N
95	3	Bulk Reanalyze Customers	/api/v1/predict/batch/reanalyze	\N	127.0.0.1	2026-09-07 09:13:01.1393+00	\N
96	1	Wipe Organization Data	/api/v1/organizations/me/data	\N	127.0.0.1	2026-09-16 09:22:25.937413+00	\N
\.


--
-- Data for Name: budget_policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budget_policies (budget_policy_id, budget_unit, budget_amount, duration_unit, duration_value, target_scope, budget_action, created_by, created_at, last_updated_by, last_updated_at, workspace, target_value) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, customer_id, organization_id, age, tenure_months, num_products, has_credit_card, is_active_member, avg_balance, monthly_transactions, support_tickets_last_90d, balance_trend_pct, days_since_last_login, salary_band, channel, churned, created_at, geography) FROM stdin;
\.


--
-- Data for Name: datasets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.datasets (dataset_uuid, experiment_id, name, digest, dataset_source_type, dataset_source, dataset_schema, dataset_profile) FROM stdin;
\.


--
-- Data for Name: endpoint_bindings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.endpoint_bindings (endpoint_id, resource_type, resource_id, created_at, created_by, last_updated_at, last_updated_by, display_name) FROM stdin;
\.


--
-- Data for Name: endpoint_model_mappings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.endpoint_model_mappings (mapping_id, endpoint_id, model_definition_id, weight, created_by, created_at, linkage_type, fallback_order) FROM stdin;
\.


--
-- Data for Name: endpoint_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.endpoint_tags (key, value, endpoint_id) FROM stdin;
\.


--
-- Data for Name: endpoints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.endpoints (endpoint_id, name, created_by, created_at, last_updated_by, last_updated_at, routing_strategy, fallback_config_json, experiment_id, usage_tracking, workspace) FROM stdin;
\.


--
-- Data for Name: entity_associations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entity_associations (association_id, source_type, source_id, destination_type, destination_id, created_time) FROM stdin;
\.


--
-- Data for Name: evaluation_dataset_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluation_dataset_records (dataset_record_id, dataset_id, inputs, expectations, tags, source, source_id, source_type, created_time, last_update_time, created_by, last_updated_by, input_hash, outputs) FROM stdin;
\.


--
-- Data for Name: evaluation_dataset_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluation_dataset_tags (dataset_id, key, value) FROM stdin;
\.


--
-- Data for Name: evaluation_datasets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluation_datasets (dataset_id, name, schema, profile, digest, created_time, last_update_time, created_by, last_updated_by, workspace) FROM stdin;
\.


--
-- Data for Name: experiment_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.experiment_tags (key, value, experiment_id) FROM stdin;
\.


--
-- Data for Name: experiments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.experiments (experiment_id, name, artifact_location, lifecycle_stage, creation_time, last_update_time, workspace) FROM stdin;
0	Default	/mlflow/artifacts/0	active	1787726161974	1787726161974	default
1	ChurnGuard	/mlflow/artifacts/1	active	1787726174959	1787726174959	default
2	ChurnGuard_MLOps	mlflow-artifacts:/2	active	1787727152386	1787727152386	default
\.


--
-- Data for Name: guardrail_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guardrail_configs (endpoint_id, guardrail_id, execution_order, created_by, created_at, workspace) FROM stdin;
\.


--
-- Data for Name: guardrails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guardrails (guardrail_id, name, scorer_id, scorer_version, stage, action, action_endpoint_id, created_by, created_at, last_updated_by, last_updated_at, workspace) FROM stdin;
\.


--
-- Data for Name: input_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.input_tags (input_uuid, name, value) FROM stdin;
\.


--
-- Data for Name: inputs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inputs (input_uuid, source_type, source_id, destination_type, destination_id, step) FROM stdin;
4dfe35a94baf43119d0d99919235006a	RUN_OUTPUT	0913f33d1cbc46ffb1e77ae32e9c01df	MODEL_OUTPUT	m-97860723a8f64bc08481440e15c0d6a7	0
1c910035a3394ff29120a1e359881cf5	RUN_OUTPUT	23bd6d4cac34414693e111cc1dca148f	MODEL_OUTPUT	m-48b910c68a9942a39bc69d72f1167935	0
c6c01dac649a4977929cd6040bddf4bd	RUN_OUTPUT	c8287e711c4143f79f7316249d28dcb2	MODEL_OUTPUT	m-f91363be938740f8b6f372628dffb741	0
78b460f5a9734d47885d7c4582be8048	RUN_OUTPUT	58be24d743d14dbdbffd75c3242c8f1a	MODEL_OUTPUT	m-9b62e99a790b4def9354980b6dc04ec3	0
f23c51116ff94428aade83d757dc11aa	RUN_OUTPUT	6fc4d8918d0a4ccb9fd203d8a79ce6d5	MODEL_OUTPUT	m-dda49acfa2cf4dafb75bdeded99bd9b4	0
691ec960aca64c8484de47d428afa522	RUN_OUTPUT	72da8640114c4615b91f12699629d3c1	MODEL_OUTPUT	m-19d854d0b13546a992780f99daddfd39	0
b08f59a76cdd45a49233600d54550d3e	RUN_OUTPUT	1c2802434d0a45ef9b924b8b1821e585	MODEL_OUTPUT	m-de172394e9934158a08a5c12661a5725	0
bea49a99e8e34099a26dcc820d28f877	RUN_OUTPUT	53009b8d3d204ec0863ac3b241f0be0e	MODEL_OUTPUT	m-fa7a8075565f4b8792c5d7fae549d8d9	0
\.


--
-- Data for Name: issues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.issues (issue_id, experiment_id, name, description, status, severity, root_causes, source_run_id, categories, created_timestamp, last_updated_timestamp, created_by) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, creation_time, job_name, params, timeout, status, result, retry_count, last_update_time, workspace, status_details) FROM stdin;
\.


--
-- Data for Name: label_schemas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.label_schemas (schema_id, experiment_id, name, type, instruction, enable_comment, input_type, input_config, created_by, created_time, last_update_time, is_default) FROM stdin;
\.


--
-- Data for Name: latest_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.latest_metrics (key, value, "timestamp", step, is_nan, run_uuid) FROM stdin;
auc_roc	0.8629	1787726176198	0	f	deaac430e91941bc9dc71faf893bcecd
precision	0.5256	1787726176198	0	f	deaac430e91941bc9dc71faf893bcecd
recall	0.7322	1787726176198	0	f	deaac430e91941bc9dc71faf893bcecd
f1	0.6119	1787726176198	0	f	deaac430e91941bc9dc71faf893bcecd
precision_at_top20pct	0.6175	1787726176198	0	f	deaac430e91941bc9dc71faf893bcecd
auc_roc	0.8629	1787726488544	0	f	0913f33d1cbc46ffb1e77ae32e9c01df
precision	0.5256	1787726488544	0	f	0913f33d1cbc46ffb1e77ae32e9c01df
recall	0.7322	1787726488544	0	f	0913f33d1cbc46ffb1e77ae32e9c01df
f1	0.6119	1787726488544	0	f	0913f33d1cbc46ffb1e77ae32e9c01df
precision_at_top20pct	0.6175	1787726488544	0	f	0913f33d1cbc46ffb1e77ae32e9c01df
auc_roc	0.8629	1787726815407	0	f	23bd6d4cac34414693e111cc1dca148f
precision	0.5256	1787726815407	0	f	23bd6d4cac34414693e111cc1dca148f
recall	0.7322	1787726815407	0	f	23bd6d4cac34414693e111cc1dca148f
f1	0.6119	1787726815407	0	f	23bd6d4cac34414693e111cc1dca148f
precision_at_top20pct	0.6175	1787726815407	0	f	23bd6d4cac34414693e111cc1dca148f
auc_roc	0.8629	1787727153438	0	f	c8287e711c4143f79f7316249d28dcb2
precision	0.5256	1787727153438	0	f	c8287e711c4143f79f7316249d28dcb2
recall	0.7322	1787727153438	0	f	c8287e711c4143f79f7316249d28dcb2
f1	0.6119	1787727153438	0	f	c8287e711c4143f79f7316249d28dcb2
precision_at_top20pct	0.6175	1787727153438	0	f	c8287e711c4143f79f7316249d28dcb2
auc_roc	0.8629	1787727166214	0	f	58be24d743d14dbdbffd75c3242c8f1a
precision	0.5256	1787727166214	0	f	58be24d743d14dbdbffd75c3242c8f1a
recall	0.7322	1787727166214	0	f	58be24d743d14dbdbffd75c3242c8f1a
f1	0.6119	1787727166214	0	f	58be24d743d14dbdbffd75c3242c8f1a
precision_at_top20pct	0.6175	1787727166214	0	f	58be24d743d14dbdbffd75c3242c8f1a
auc_roc	0.8686	1787730641539	0	f	6fc4d8918d0a4ccb9fd203d8a79ce6d5
precision	0.7213	1787730641539	0	f	6fc4d8918d0a4ccb9fd203d8a79ce6d5
recall	0.5405	1787730641539	0	f	6fc4d8918d0a4ccb9fd203d8a79ce6d5
f1	0.618	1787730641539	0	f	6fc4d8918d0a4ccb9fd203d8a79ce6d5
precision_at_top20pct	0.635	1787730641539	0	f	6fc4d8918d0a4ccb9fd203d8a79ce6d5
auc_roc	0.8689	1787733117161	0	f	72da8640114c4615b91f12699629d3c1
precision	0.732	1787733117161	0	f	72da8640114c4615b91f12699629d3c1
recall	0.5504	1787733117161	0	f	72da8640114c4615b91f12699629d3c1
f1	0.6283	1787733117161	0	f	72da8640114c4615b91f12699629d3c1
precision_at_top20pct	0.6275	1787733117161	0	f	72da8640114c4615b91f12699629d3c1
auc_roc	0.868	1787733487748	0	f	1c2802434d0a45ef9b924b8b1821e585
precision	0.7318	1787733487748	0	f	1c2802434d0a45ef9b924b8b1821e585
recall	0.543	1787733487748	0	f	1c2802434d0a45ef9b924b8b1821e585
f1	0.6234	1787733487748	0	f	1c2802434d0a45ef9b924b8b1821e585
precision_at_top20pct	0.635	1787733487748	0	f	1c2802434d0a45ef9b924b8b1821e585
auc_roc	0.8676	1787733511869	0	f	53009b8d3d204ec0863ac3b241f0be0e
precision	0.7143	1787733511869	0	f	53009b8d3d204ec0863ac3b241f0be0e
recall	0.5283	1787733511869	0	f	53009b8d3d204ec0863ac3b241f0be0e
f1	0.6073	1787733511869	0	f	53009b8d3d204ec0863ac3b241f0be0e
precision_at_top20pct	0.635	1787733511869	0	f	53009b8d3d204ec0863ac3b241f0be0e
\.


--
-- Data for Name: logged_model_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logged_model_metrics (model_id, metric_name, metric_timestamp_ms, metric_step, metric_value, experiment_id, run_id, dataset_uuid, dataset_name, dataset_digest) FROM stdin;
m-97860723a8f64bc08481440e15c0d6a7	auc_roc	1787726488544	0	0.8629	1	0913f33d1cbc46ffb1e77ae32e9c01df	\N	\N	\N
m-97860723a8f64bc08481440e15c0d6a7	precision	1787726488544	0	0.5256	1	0913f33d1cbc46ffb1e77ae32e9c01df	\N	\N	\N
m-97860723a8f64bc08481440e15c0d6a7	recall	1787726488544	0	0.7322	1	0913f33d1cbc46ffb1e77ae32e9c01df	\N	\N	\N
m-97860723a8f64bc08481440e15c0d6a7	f1	1787726488544	0	0.6119	1	0913f33d1cbc46ffb1e77ae32e9c01df	\N	\N	\N
m-97860723a8f64bc08481440e15c0d6a7	precision_at_top20pct	1787726488544	0	0.6175	1	0913f33d1cbc46ffb1e77ae32e9c01df	\N	\N	\N
m-48b910c68a9942a39bc69d72f1167935	auc_roc	1787726815407	0	0.8629	1	23bd6d4cac34414693e111cc1dca148f	\N	\N	\N
m-48b910c68a9942a39bc69d72f1167935	precision	1787726815407	0	0.5256	1	23bd6d4cac34414693e111cc1dca148f	\N	\N	\N
m-48b910c68a9942a39bc69d72f1167935	recall	1787726815407	0	0.7322	1	23bd6d4cac34414693e111cc1dca148f	\N	\N	\N
m-48b910c68a9942a39bc69d72f1167935	f1	1787726815407	0	0.6119	1	23bd6d4cac34414693e111cc1dca148f	\N	\N	\N
m-48b910c68a9942a39bc69d72f1167935	precision_at_top20pct	1787726815407	0	0.6175	1	23bd6d4cac34414693e111cc1dca148f	\N	\N	\N
m-f91363be938740f8b6f372628dffb741	auc_roc	1787727153438	0	0.8629	2	c8287e711c4143f79f7316249d28dcb2	\N	\N	\N
m-f91363be938740f8b6f372628dffb741	precision	1787727153438	0	0.5256	2	c8287e711c4143f79f7316249d28dcb2	\N	\N	\N
m-f91363be938740f8b6f372628dffb741	recall	1787727153438	0	0.7322	2	c8287e711c4143f79f7316249d28dcb2	\N	\N	\N
m-f91363be938740f8b6f372628dffb741	f1	1787727153438	0	0.6119	2	c8287e711c4143f79f7316249d28dcb2	\N	\N	\N
m-f91363be938740f8b6f372628dffb741	precision_at_top20pct	1787727153438	0	0.6175	2	c8287e711c4143f79f7316249d28dcb2	\N	\N	\N
m-9b62e99a790b4def9354980b6dc04ec3	auc_roc	1787727166214	0	0.8629	2	58be24d743d14dbdbffd75c3242c8f1a	\N	\N	\N
m-9b62e99a790b4def9354980b6dc04ec3	precision	1787727166214	0	0.5256	2	58be24d743d14dbdbffd75c3242c8f1a	\N	\N	\N
m-9b62e99a790b4def9354980b6dc04ec3	recall	1787727166214	0	0.7322	2	58be24d743d14dbdbffd75c3242c8f1a	\N	\N	\N
m-9b62e99a790b4def9354980b6dc04ec3	f1	1787727166214	0	0.6119	2	58be24d743d14dbdbffd75c3242c8f1a	\N	\N	\N
m-9b62e99a790b4def9354980b6dc04ec3	precision_at_top20pct	1787727166214	0	0.6175	2	58be24d743d14dbdbffd75c3242c8f1a	\N	\N	\N
m-dda49acfa2cf4dafb75bdeded99bd9b4	auc_roc	1787730641539	0	0.8686	2	6fc4d8918d0a4ccb9fd203d8a79ce6d5	\N	\N	\N
m-dda49acfa2cf4dafb75bdeded99bd9b4	precision	1787730641539	0	0.7213	2	6fc4d8918d0a4ccb9fd203d8a79ce6d5	\N	\N	\N
m-dda49acfa2cf4dafb75bdeded99bd9b4	recall	1787730641539	0	0.5405	2	6fc4d8918d0a4ccb9fd203d8a79ce6d5	\N	\N	\N
m-dda49acfa2cf4dafb75bdeded99bd9b4	f1	1787730641539	0	0.618	2	6fc4d8918d0a4ccb9fd203d8a79ce6d5	\N	\N	\N
m-dda49acfa2cf4dafb75bdeded99bd9b4	precision_at_top20pct	1787730641539	0	0.635	2	6fc4d8918d0a4ccb9fd203d8a79ce6d5	\N	\N	\N
m-19d854d0b13546a992780f99daddfd39	auc_roc	1787733117161	0	0.8689	2	72da8640114c4615b91f12699629d3c1	\N	\N	\N
m-19d854d0b13546a992780f99daddfd39	precision	1787733117161	0	0.732	2	72da8640114c4615b91f12699629d3c1	\N	\N	\N
m-19d854d0b13546a992780f99daddfd39	recall	1787733117161	0	0.5504	2	72da8640114c4615b91f12699629d3c1	\N	\N	\N
m-19d854d0b13546a992780f99daddfd39	f1	1787733117161	0	0.6283	2	72da8640114c4615b91f12699629d3c1	\N	\N	\N
m-19d854d0b13546a992780f99daddfd39	precision_at_top20pct	1787733117161	0	0.6275	2	72da8640114c4615b91f12699629d3c1	\N	\N	\N
m-de172394e9934158a08a5c12661a5725	auc_roc	1787733487748	0	0.868	2	1c2802434d0a45ef9b924b8b1821e585	\N	\N	\N
m-de172394e9934158a08a5c12661a5725	precision	1787733487748	0	0.7318	2	1c2802434d0a45ef9b924b8b1821e585	\N	\N	\N
m-de172394e9934158a08a5c12661a5725	recall	1787733487748	0	0.543	2	1c2802434d0a45ef9b924b8b1821e585	\N	\N	\N
m-de172394e9934158a08a5c12661a5725	f1	1787733487748	0	0.6234	2	1c2802434d0a45ef9b924b8b1821e585	\N	\N	\N
m-de172394e9934158a08a5c12661a5725	precision_at_top20pct	1787733487748	0	0.635	2	1c2802434d0a45ef9b924b8b1821e585	\N	\N	\N
m-fa7a8075565f4b8792c5d7fae549d8d9	auc_roc	1787733511869	0	0.8676	2	53009b8d3d204ec0863ac3b241f0be0e	\N	\N	\N
m-fa7a8075565f4b8792c5d7fae549d8d9	precision	1787733511869	0	0.7143	2	53009b8d3d204ec0863ac3b241f0be0e	\N	\N	\N
m-fa7a8075565f4b8792c5d7fae549d8d9	recall	1787733511869	0	0.5283	2	53009b8d3d204ec0863ac3b241f0be0e	\N	\N	\N
m-fa7a8075565f4b8792c5d7fae549d8d9	f1	1787733511869	0	0.6073	2	53009b8d3d204ec0863ac3b241f0be0e	\N	\N	\N
m-fa7a8075565f4b8792c5d7fae549d8d9	precision_at_top20pct	1787733511869	0	0.635	2	53009b8d3d204ec0863ac3b241f0be0e	\N	\N	\N
\.


--
-- Data for Name: logged_model_params; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logged_model_params (model_id, experiment_id, param_key, param_value) FROM stdin;
m-97860723a8f64bc08481440e15c0d6a7	1	n_estimators	300
m-97860723a8f64bc08481440e15c0d6a7	1	max_depth	4
m-97860723a8f64bc08481440e15c0d6a7	1	learning_rate	0.05
m-97860723a8f64bc08481440e15c0d6a7	1	subsample	0.9
m-97860723a8f64bc08481440e15c0d6a7	1	colsample_bytree	0.9
m-97860723a8f64bc08481440e15c0d6a7	1	scale_pos_weight	3.9079754601226995
m-97860723a8f64bc08481440e15c0d6a7	1	eval_metric	auc
m-97860723a8f64bc08481440e15c0d6a7	1	random_state	42
m-48b910c68a9942a39bc69d72f1167935	1	n_estimators	300
m-48b910c68a9942a39bc69d72f1167935	1	max_depth	4
m-48b910c68a9942a39bc69d72f1167935	1	learning_rate	0.05
m-48b910c68a9942a39bc69d72f1167935	1	subsample	0.9
m-48b910c68a9942a39bc69d72f1167935	1	colsample_bytree	0.9
m-48b910c68a9942a39bc69d72f1167935	1	scale_pos_weight	3.9079754601226995
m-48b910c68a9942a39bc69d72f1167935	1	eval_metric	auc
m-48b910c68a9942a39bc69d72f1167935	1	random_state	42
m-f91363be938740f8b6f372628dffb741	2	n_estimators	300
m-f91363be938740f8b6f372628dffb741	2	max_depth	4
m-f91363be938740f8b6f372628dffb741	2	learning_rate	0.05
m-f91363be938740f8b6f372628dffb741	2	subsample	0.9
m-f91363be938740f8b6f372628dffb741	2	colsample_bytree	0.9
m-f91363be938740f8b6f372628dffb741	2	scale_pos_weight	3.9079754601226995
m-f91363be938740f8b6f372628dffb741	2	eval_metric	auc
m-f91363be938740f8b6f372628dffb741	2	random_state	42
m-9b62e99a790b4def9354980b6dc04ec3	2	n_estimators	300
m-9b62e99a790b4def9354980b6dc04ec3	2	max_depth	4
m-9b62e99a790b4def9354980b6dc04ec3	2	learning_rate	0.05
m-9b62e99a790b4def9354980b6dc04ec3	2	subsample	0.9
m-9b62e99a790b4def9354980b6dc04ec3	2	colsample_bytree	0.9
m-9b62e99a790b4def9354980b6dc04ec3	2	scale_pos_weight	3.9079754601226995
m-9b62e99a790b4def9354980b6dc04ec3	2	eval_metric	auc
m-9b62e99a790b4def9354980b6dc04ec3	2	random_state	42
m-dda49acfa2cf4dafb75bdeded99bd9b4	2	n_estimators	113
m-dda49acfa2cf4dafb75bdeded99bd9b4	2	max_depth	3
m-dda49acfa2cf4dafb75bdeded99bd9b4	2	learning_rate	0.06290888335962679
m-dda49acfa2cf4dafb75bdeded99bd9b4	2	subsample	0.9355442659570059
m-dda49acfa2cf4dafb75bdeded99bd9b4	2	colsample_bytree	0.8867852169636173
m-dda49acfa2cf4dafb75bdeded99bd9b4	2	scale_pos_weight	3.9079754601226995
m-dda49acfa2cf4dafb75bdeded99bd9b4	2	random_state	42
m-dda49acfa2cf4dafb75bdeded99bd9b4	2	eval_metric	auc
m-19d854d0b13546a992780f99daddfd39	2	n_estimators	255
m-19d854d0b13546a992780f99daddfd39	2	max_depth	3
m-19d854d0b13546a992780f99daddfd39	2	learning_rate	0.05649338360531188
m-19d854d0b13546a992780f99daddfd39	2	subsample	0.7050652446620809
m-19d854d0b13546a992780f99daddfd39	2	colsample_bytree	0.7507356013136578
m-19d854d0b13546a992780f99daddfd39	2	scale_pos_weight	3.9079754601226995
m-19d854d0b13546a992780f99daddfd39	2	random_state	42
m-19d854d0b13546a992780f99daddfd39	2	eval_metric	auc
m-de172394e9934158a08a5c12661a5725	2	n_estimators	229
m-de172394e9934158a08a5c12661a5725	2	max_depth	4
m-de172394e9934158a08a5c12661a5725	2	learning_rate	0.030652337662138127
m-de172394e9934158a08a5c12661a5725	2	subsample	0.845472224832101
m-de172394e9934158a08a5c12661a5725	2	colsample_bytree	0.8684292754223399
m-de172394e9934158a08a5c12661a5725	2	scale_pos_weight	3.9079754601226995
m-de172394e9934158a08a5c12661a5725	2	random_state	42
m-de172394e9934158a08a5c12661a5725	2	eval_metric	auc
m-fa7a8075565f4b8792c5d7fae549d8d9	2	n_estimators	282
m-fa7a8075565f4b8792c5d7fae549d8d9	2	max_depth	3
m-fa7a8075565f4b8792c5d7fae549d8d9	2	learning_rate	0.049104283351899806
m-fa7a8075565f4b8792c5d7fae549d8d9	2	subsample	0.9953794782390168
m-fa7a8075565f4b8792c5d7fae549d8d9	2	colsample_bytree	0.8607413842390099
m-fa7a8075565f4b8792c5d7fae549d8d9	2	scale_pos_weight	3.9079754601226995
m-fa7a8075565f4b8792c5d7fae549d8d9	2	random_state	42
m-fa7a8075565f4b8792c5d7fae549d8d9	2	eval_metric	auc
\.


--
-- Data for Name: logged_model_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logged_model_tags (model_id, experiment_id, tag_key, tag_value) FROM stdin;
m-97860723a8f64bc08481440e15c0d6a7	1	mlflow.user	aspl96
m-97860723a8f64bc08481440e15c0d6a7	1	mlflow.source.name	src/models/train.py
m-97860723a8f64bc08481440e15c0d6a7	1	mlflow.source.type	LOCAL
m-97860723a8f64bc08481440e15c0d6a7	1	mlflow.source.git.commit	c30978838ba5b93e35179fa571c076d7e356c232
m-97860723a8f64bc08481440e15c0d6a7	1	mlflow.source.git.branch	main
m-97860723a8f64bc08481440e15c0d6a7	1	mlflow.source.git.repoURL	https://github.com/AshoreSystems/ChurnGuard.git
m-48b910c68a9942a39bc69d72f1167935	1	mlflow.user	aspl96
m-48b910c68a9942a39bc69d72f1167935	1	mlflow.source.name	src/models/train.py
m-48b910c68a9942a39bc69d72f1167935	1	mlflow.source.type	LOCAL
m-48b910c68a9942a39bc69d72f1167935	1	mlflow.source.git.commit	c30978838ba5b93e35179fa571c076d7e356c232
m-48b910c68a9942a39bc69d72f1167935	1	mlflow.source.git.branch	main
m-48b910c68a9942a39bc69d72f1167935	1	mlflow.source.git.repoURL	https://github.com/AshoreSystems/ChurnGuard.git
m-f91363be938740f8b6f372628dffb741	2	mlflow.user	aspl96
m-f91363be938740f8b6f372628dffb741	2	mlflow.source.name	src/models/train.py
m-f91363be938740f8b6f372628dffb741	2	mlflow.source.type	LOCAL
m-f91363be938740f8b6f372628dffb741	2	mlflow.source.git.commit	c30978838ba5b93e35179fa571c076d7e356c232
m-f91363be938740f8b6f372628dffb741	2	mlflow.source.git.branch	main
m-f91363be938740f8b6f372628dffb741	2	mlflow.source.git.repoURL	https://github.com/AshoreSystems/ChurnGuard.git
m-9b62e99a790b4def9354980b6dc04ec3	2	mlflow.user	aspl96
m-9b62e99a790b4def9354980b6dc04ec3	2	mlflow.source.name	src/models/train.py
m-9b62e99a790b4def9354980b6dc04ec3	2	mlflow.source.type	LOCAL
m-9b62e99a790b4def9354980b6dc04ec3	2	mlflow.source.git.commit	c30978838ba5b93e35179fa571c076d7e356c232
m-9b62e99a790b4def9354980b6dc04ec3	2	mlflow.source.git.branch	main
m-9b62e99a790b4def9354980b6dc04ec3	2	mlflow.source.git.repoURL	https://github.com/AshoreSystems/ChurnGuard.git
m-dda49acfa2cf4dafb75bdeded99bd9b4	2	mlflow.user	root
m-dda49acfa2cf4dafb75bdeded99bd9b4	2	mlflow.source.name	src/models/train.py
m-dda49acfa2cf4dafb75bdeded99bd9b4	2	mlflow.source.type	LOCAL
m-19d854d0b13546a992780f99daddfd39	2	mlflow.user	root
m-19d854d0b13546a992780f99daddfd39	2	mlflow.source.name	src/models/train.py
m-19d854d0b13546a992780f99daddfd39	2	mlflow.source.type	LOCAL
m-de172394e9934158a08a5c12661a5725	2	mlflow.user	root
m-de172394e9934158a08a5c12661a5725	2	mlflow.source.name	src/models/train.py
m-de172394e9934158a08a5c12661a5725	2	mlflow.source.type	LOCAL
m-fa7a8075565f4b8792c5d7fae549d8d9	2	mlflow.user	root
m-fa7a8075565f4b8792c5d7fae549d8d9	2	mlflow.source.name	src/models/train.py
m-fa7a8075565f4b8792c5d7fae549d8d9	2	mlflow.source.type	LOCAL
\.


--
-- Data for Name: logged_models; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logged_models (model_id, experiment_id, name, artifact_location, creation_timestamp_ms, last_updated_timestamp_ms, status, lifecycle_stage, model_type, source_run_id, status_message) FROM stdin;
m-97860723a8f64bc08481440e15c0d6a7	1	model	/mlflow/artifacts/1/models/m-97860723a8f64bc08481440e15c0d6a7/artifacts	1787726488607	1787726512927	3	active		0913f33d1cbc46ffb1e77ae32e9c01df	\N
m-48b910c68a9942a39bc69d72f1167935	1	model	/mlflow/artifacts/1/models/m-48b910c68a9942a39bc69d72f1167935/artifacts	1787726815473	1787726833118	3	active		23bd6d4cac34414693e111cc1dca148f	\N
m-f91363be938740f8b6f372628dffb741	2	model	mlflow-artifacts:/2/models/m-f91363be938740f8b6f372628dffb741/artifacts	1787727153495	1787727153495	1	active		c8287e711c4143f79f7316249d28dcb2	\N
m-9b62e99a790b4def9354980b6dc04ec3	2	model	mlflow-artifacts:/2/models/m-9b62e99a790b4def9354980b6dc04ec3/artifacts	1787727166271	1787727174711	2	active		58be24d743d14dbdbffd75c3242c8f1a	\N
m-dda49acfa2cf4dafb75bdeded99bd9b4	2	model	mlflow-artifacts:/2/models/m-dda49acfa2cf4dafb75bdeded99bd9b4/artifacts	1787730642168	1787730647203	3	active		6fc4d8918d0a4ccb9fd203d8a79ce6d5	\N
m-19d854d0b13546a992780f99daddfd39	2	model	mlflow-artifacts:/2/models/m-19d854d0b13546a992780f99daddfd39/artifacts	1787733117677	1787733137711	2	active		72da8640114c4615b91f12699629d3c1	\N
m-de172394e9934158a08a5c12661a5725	2	model	mlflow-artifacts:/2/models/m-de172394e9934158a08a5c12661a5725/artifacts	1787733488004	1787733495069	2	active		1c2802434d0a45ef9b924b8b1821e585	\N
m-fa7a8075565f4b8792c5d7fae549d8d9	2	model	mlflow-artifacts:/2/models/m-fa7a8075565f4b8792c5d7fae549d8d9/artifacts	1787733512345	1787733518959	2	active		53009b8d3d204ec0863ac3b241f0be0e	\N
\.


--
-- Data for Name: mcp_access_endpoints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mcp_access_endpoints (id, workspace, server_name, server_version, server_alias, url, transport_type, created_by, last_updated_by, created_at, last_updated_at) FROM stdin;
\.


--
-- Data for Name: mcp_server_aliases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mcp_server_aliases (workspace, name, alias, version) FROM stdin;
\.


--
-- Data for Name: mcp_server_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mcp_server_tags (workspace, name, key, value) FROM stdin;
\.


--
-- Data for Name: mcp_server_version_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mcp_server_version_tags (workspace, name, version, key, value) FROM stdin;
\.


--
-- Data for Name: mcp_server_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mcp_server_versions (workspace, name, version, version_major, version_minor, version_patch, version_prerelease_sort_key, server_json, status, tools, source, connect_options, created_by, last_updated_by, created_at, last_updated_at) FROM stdin;
\.


--
-- Data for Name: mcp_servers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mcp_servers (workspace, name, display_name, description, icons, created_by, last_updated_by, created_at, last_updated_at) FROM stdin;
\.


--
-- Data for Name: metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metrics (key, value, "timestamp", run_uuid, step, is_nan) FROM stdin;
auc_roc	0.8629	1787726176198	deaac430e91941bc9dc71faf893bcecd	0	f
precision	0.5256	1787726176198	deaac430e91941bc9dc71faf893bcecd	0	f
recall	0.7322	1787726176198	deaac430e91941bc9dc71faf893bcecd	0	f
f1	0.6119	1787726176198	deaac430e91941bc9dc71faf893bcecd	0	f
precision_at_top20pct	0.6175	1787726176198	deaac430e91941bc9dc71faf893bcecd	0	f
auc_roc	0.8629	1787726488544	0913f33d1cbc46ffb1e77ae32e9c01df	0	f
precision	0.5256	1787726488544	0913f33d1cbc46ffb1e77ae32e9c01df	0	f
recall	0.7322	1787726488544	0913f33d1cbc46ffb1e77ae32e9c01df	0	f
f1	0.6119	1787726488544	0913f33d1cbc46ffb1e77ae32e9c01df	0	f
precision_at_top20pct	0.6175	1787726488544	0913f33d1cbc46ffb1e77ae32e9c01df	0	f
auc_roc	0.8629	1787726815407	23bd6d4cac34414693e111cc1dca148f	0	f
precision	0.5256	1787726815407	23bd6d4cac34414693e111cc1dca148f	0	f
recall	0.7322	1787726815407	23bd6d4cac34414693e111cc1dca148f	0	f
f1	0.6119	1787726815407	23bd6d4cac34414693e111cc1dca148f	0	f
precision_at_top20pct	0.6175	1787726815407	23bd6d4cac34414693e111cc1dca148f	0	f
auc_roc	0.8629	1787727153438	c8287e711c4143f79f7316249d28dcb2	0	f
precision	0.5256	1787727153438	c8287e711c4143f79f7316249d28dcb2	0	f
recall	0.7322	1787727153438	c8287e711c4143f79f7316249d28dcb2	0	f
f1	0.6119	1787727153438	c8287e711c4143f79f7316249d28dcb2	0	f
precision_at_top20pct	0.6175	1787727153438	c8287e711c4143f79f7316249d28dcb2	0	f
auc_roc	0.8629	1787727166214	58be24d743d14dbdbffd75c3242c8f1a	0	f
precision	0.5256	1787727166214	58be24d743d14dbdbffd75c3242c8f1a	0	f
recall	0.7322	1787727166214	58be24d743d14dbdbffd75c3242c8f1a	0	f
f1	0.6119	1787727166214	58be24d743d14dbdbffd75c3242c8f1a	0	f
precision_at_top20pct	0.6175	1787727166214	58be24d743d14dbdbffd75c3242c8f1a	0	f
auc_roc	0.8686	1787730641539	6fc4d8918d0a4ccb9fd203d8a79ce6d5	0	f
precision	0.7213	1787730641539	6fc4d8918d0a4ccb9fd203d8a79ce6d5	0	f
recall	0.5405	1787730641539	6fc4d8918d0a4ccb9fd203d8a79ce6d5	0	f
f1	0.618	1787730641539	6fc4d8918d0a4ccb9fd203d8a79ce6d5	0	f
precision_at_top20pct	0.635	1787730641539	6fc4d8918d0a4ccb9fd203d8a79ce6d5	0	f
auc_roc	0.8689	1787733117161	72da8640114c4615b91f12699629d3c1	0	f
precision	0.732	1787733117161	72da8640114c4615b91f12699629d3c1	0	f
recall	0.5504	1787733117161	72da8640114c4615b91f12699629d3c1	0	f
f1	0.6283	1787733117161	72da8640114c4615b91f12699629d3c1	0	f
precision_at_top20pct	0.6275	1787733117161	72da8640114c4615b91f12699629d3c1	0	f
auc_roc	0.868	1787733487748	1c2802434d0a45ef9b924b8b1821e585	0	f
precision	0.7318	1787733487748	1c2802434d0a45ef9b924b8b1821e585	0	f
recall	0.543	1787733487748	1c2802434d0a45ef9b924b8b1821e585	0	f
f1	0.6234	1787733487748	1c2802434d0a45ef9b924b8b1821e585	0	f
precision_at_top20pct	0.635	1787733487748	1c2802434d0a45ef9b924b8b1821e585	0	f
auc_roc	0.8676	1787733511869	53009b8d3d204ec0863ac3b241f0be0e	0	f
precision	0.7143	1787733511869	53009b8d3d204ec0863ac3b241f0be0e	0	f
recall	0.5283	1787733511869	53009b8d3d204ec0863ac3b241f0be0e	0	f
f1	0.6073	1787733511869	53009b8d3d204ec0863ac3b241f0be0e	0	f
precision_at_top20pct	0.635	1787733511869	53009b8d3d204ec0863ac3b241f0be0e	0	f
\.


--
-- Data for Name: model_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_definitions (model_definition_id, name, secret_id, provider, model_name, created_by, created_at, last_updated_by, last_updated_at, workspace) FROM stdin;
\.


--
-- Data for Name: model_version_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_version_tags (key, value, name, version, workspace) FROM stdin;
\.


--
-- Data for Name: model_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_versions (name, version, creation_time, last_updated_time, description, user_id, current_stage, source, run_id, status, status_message, run_link, storage_location, workspace) FROM stdin;
\.


--
-- Data for Name: models; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.models (id, organization_id, name, version, model_type, metrics, is_active, created_at) FROM stdin;
1	1	Production XGBoost v1	1.0	xgboost	\N	t	2026-08-26 12:02:34.293339+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: online_scoring_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.online_scoring_configs (online_scoring_config_id, scorer_id, sample_rate, experiment_id, filter_string) FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, created_at, require_2fa, session_timeout) FROM stdin;
1	System	2026-08-26 11:55:53.559269+00	f	15 Minutes
2	ashore sys bank	2026-08-26 12:28:19.26173+00	f	1 Hour
\.


--
-- Data for Name: params; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.params (key, value, run_uuid) FROM stdin;
n_estimators	300	deaac430e91941bc9dc71faf893bcecd
max_depth	4	deaac430e91941bc9dc71faf893bcecd
learning_rate	0.05	deaac430e91941bc9dc71faf893bcecd
subsample	0.9	deaac430e91941bc9dc71faf893bcecd
colsample_bytree	0.9	deaac430e91941bc9dc71faf893bcecd
scale_pos_weight	3.9079754601226995	deaac430e91941bc9dc71faf893bcecd
eval_metric	auc	deaac430e91941bc9dc71faf893bcecd
random_state	42	deaac430e91941bc9dc71faf893bcecd
n_estimators	300	0913f33d1cbc46ffb1e77ae32e9c01df
max_depth	4	0913f33d1cbc46ffb1e77ae32e9c01df
learning_rate	0.05	0913f33d1cbc46ffb1e77ae32e9c01df
subsample	0.9	0913f33d1cbc46ffb1e77ae32e9c01df
colsample_bytree	0.9	0913f33d1cbc46ffb1e77ae32e9c01df
scale_pos_weight	3.9079754601226995	0913f33d1cbc46ffb1e77ae32e9c01df
eval_metric	auc	0913f33d1cbc46ffb1e77ae32e9c01df
random_state	42	0913f33d1cbc46ffb1e77ae32e9c01df
n_estimators	300	23bd6d4cac34414693e111cc1dca148f
max_depth	4	23bd6d4cac34414693e111cc1dca148f
learning_rate	0.05	23bd6d4cac34414693e111cc1dca148f
subsample	0.9	23bd6d4cac34414693e111cc1dca148f
colsample_bytree	0.9	23bd6d4cac34414693e111cc1dca148f
scale_pos_weight	3.9079754601226995	23bd6d4cac34414693e111cc1dca148f
eval_metric	auc	23bd6d4cac34414693e111cc1dca148f
random_state	42	23bd6d4cac34414693e111cc1dca148f
n_estimators	300	c8287e711c4143f79f7316249d28dcb2
max_depth	4	c8287e711c4143f79f7316249d28dcb2
learning_rate	0.05	c8287e711c4143f79f7316249d28dcb2
subsample	0.9	c8287e711c4143f79f7316249d28dcb2
colsample_bytree	0.9	c8287e711c4143f79f7316249d28dcb2
scale_pos_weight	3.9079754601226995	c8287e711c4143f79f7316249d28dcb2
eval_metric	auc	c8287e711c4143f79f7316249d28dcb2
random_state	42	c8287e711c4143f79f7316249d28dcb2
n_estimators	300	58be24d743d14dbdbffd75c3242c8f1a
max_depth	4	58be24d743d14dbdbffd75c3242c8f1a
learning_rate	0.05	58be24d743d14dbdbffd75c3242c8f1a
subsample	0.9	58be24d743d14dbdbffd75c3242c8f1a
colsample_bytree	0.9	58be24d743d14dbdbffd75c3242c8f1a
scale_pos_weight	3.9079754601226995	58be24d743d14dbdbffd75c3242c8f1a
eval_metric	auc	58be24d743d14dbdbffd75c3242c8f1a
random_state	42	58be24d743d14dbdbffd75c3242c8f1a
n_estimators	113	6fc4d8918d0a4ccb9fd203d8a79ce6d5
max_depth	3	6fc4d8918d0a4ccb9fd203d8a79ce6d5
learning_rate	0.06290888335962679	6fc4d8918d0a4ccb9fd203d8a79ce6d5
subsample	0.9355442659570059	6fc4d8918d0a4ccb9fd203d8a79ce6d5
colsample_bytree	0.8867852169636173	6fc4d8918d0a4ccb9fd203d8a79ce6d5
scale_pos_weight	3.9079754601226995	6fc4d8918d0a4ccb9fd203d8a79ce6d5
random_state	42	6fc4d8918d0a4ccb9fd203d8a79ce6d5
eval_metric	auc	6fc4d8918d0a4ccb9fd203d8a79ce6d5
n_estimators	255	72da8640114c4615b91f12699629d3c1
max_depth	3	72da8640114c4615b91f12699629d3c1
learning_rate	0.05649338360531188	72da8640114c4615b91f12699629d3c1
subsample	0.7050652446620809	72da8640114c4615b91f12699629d3c1
colsample_bytree	0.7507356013136578	72da8640114c4615b91f12699629d3c1
scale_pos_weight	3.9079754601226995	72da8640114c4615b91f12699629d3c1
random_state	42	72da8640114c4615b91f12699629d3c1
eval_metric	auc	72da8640114c4615b91f12699629d3c1
n_estimators	229	1c2802434d0a45ef9b924b8b1821e585
max_depth	4	1c2802434d0a45ef9b924b8b1821e585
learning_rate	0.030652337662138127	1c2802434d0a45ef9b924b8b1821e585
subsample	0.845472224832101	1c2802434d0a45ef9b924b8b1821e585
colsample_bytree	0.8684292754223399	1c2802434d0a45ef9b924b8b1821e585
scale_pos_weight	3.9079754601226995	1c2802434d0a45ef9b924b8b1821e585
random_state	42	1c2802434d0a45ef9b924b8b1821e585
eval_metric	auc	1c2802434d0a45ef9b924b8b1821e585
n_estimators	282	53009b8d3d204ec0863ac3b241f0be0e
max_depth	3	53009b8d3d204ec0863ac3b241f0be0e
learning_rate	0.049104283351899806	53009b8d3d204ec0863ac3b241f0be0e
subsample	0.9953794782390168	53009b8d3d204ec0863ac3b241f0be0e
colsample_bytree	0.8607413842390099	53009b8d3d204ec0863ac3b241f0be0e
scale_pos_weight	3.9079754601226995	53009b8d3d204ec0863ac3b241f0be0e
random_state	42	53009b8d3d204ec0863ac3b241f0be0e
eval_metric	auc	53009b8d3d204ec0863ac3b241f0be0e
\.


--
-- Data for Name: prediction_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prediction_history (id, customer_db_id, model_id, probability, prediction, risk_tier, top_factors, created_at, llm_strategy) FROM stdin;
\.


--
-- Data for Name: registered_model_aliases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registered_model_aliases (alias, version, name, workspace) FROM stdin;
\.


--
-- Data for Name: registered_model_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registered_model_tags (key, value, name, workspace) FROM stdin;
\.


--
-- Data for Name: registered_models; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registered_models (name, creation_time, last_updated_time, description, workspace) FROM stdin;
\.


--
-- Data for Name: review_queue_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review_queue_items (queue_id, item_type, item_id, status, completed_by, completed_time_ms, creation_time_ms, last_update_time_ms) FROM stdin;
\.


--
-- Data for Name: review_queue_label_schemas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review_queue_label_schemas (queue_id, schema_id) FROM stdin;
\.


--
-- Data for Name: review_queue_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review_queue_users (queue_id, user_id) FROM stdin;
\.


--
-- Data for Name: review_queues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review_queues (queue_id, experiment_id, name, queue_type, created_by, creation_time_ms, last_update_time_ms, name_key) FROM stdin;
\.


--
-- Data for Name: runs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.runs (run_uuid, name, source_type, source_name, entry_point_name, user_id, status, start_time, end_time, source_version, lifecycle_stage, artifact_uri, experiment_id, deleted_time) FROM stdin;
deaac430e91941bc9dc71faf893bcecd	xgboost_candidate	UNKNOWN			aspl96	FAILED	1787726175116	1787726176298		active	/mlflow/artifacts/1/deaac430e91941bc9dc71faf893bcecd/artifacts	1	\N
0913f33d1cbc46ffb1e77ae32e9c01df	xgboost_candidate	UNKNOWN			aspl96	FAILED	1787726488122	1787726512953		active	/mlflow/artifacts/1/0913f33d1cbc46ffb1e77ae32e9c01df/artifacts	1	\N
23bd6d4cac34414693e111cc1dca148f	xgboost_candidate	UNKNOWN			aspl96	FAILED	1787726814868	1787726833151		active	/mlflow/artifacts/1/23bd6d4cac34414693e111cc1dca148f/artifacts	1	\N
c8287e711c4143f79f7316249d28dcb2	xgboost_candidate	UNKNOWN			aspl96	RUNNING	1787727152984	\N		active	mlflow-artifacts:/2/c8287e711c4143f79f7316249d28dcb2/artifacts	2	\N
58be24d743d14dbdbffd75c3242c8f1a	xgboost_candidate	UNKNOWN			aspl96	FINISHED	1787727165650	1787727174791		active	mlflow-artifacts:/2/58be24d743d14dbdbffd75c3242c8f1a/artifacts	2	\N
6fc4d8918d0a4ccb9fd203d8a79ce6d5	fintech_calibrated_xgboost	UNKNOWN			root	FAILED	1787730638809	1787730647266		active	mlflow-artifacts:/2/6fc4d8918d0a4ccb9fd203d8a79ce6d5/artifacts	2	\N
72da8640114c4615b91f12699629d3c1	fintech_calibrated_xgboost	UNKNOWN			root	FAILED	1787733112754	1787733137804		active	mlflow-artifacts:/2/72da8640114c4615b91f12699629d3c1/artifacts	2	\N
1c2802434d0a45ef9b924b8b1821e585	fintech_calibrated_xgboost	UNKNOWN			root	FINISHED	1787733449457	1787733508904		active	mlflow-artifacts:/2/1c2802434d0a45ef9b924b8b1821e585/artifacts	2	\N
53009b8d3d204ec0863ac3b241f0be0e	fintech_calibrated_xgboost	UNKNOWN			root	FINISHED	1787733509343	1787733519587		active	mlflow-artifacts:/2/53009b8d3d204ec0863ac3b241f0be0e/artifacts	2	\N
\.


--
-- Data for Name: scorer_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scorer_versions (scorer_id, scorer_version, serialized_scorer, creation_time) FROM stdin;
\.


--
-- Data for Name: scorers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scorers (experiment_id, scorer_name, scorer_id) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.secrets (secret_id, secret_name, encrypted_value, wrapped_dek, kek_version, masked_value, provider, auth_config, description, created_by, created_at, last_updated_by, last_updated_at, workspace) FROM stdin;
\.


--
-- Data for Name: span_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.span_metrics (trace_id, span_id, key, value) FROM stdin;
\.


--
-- Data for Name: spans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spans (trace_id, experiment_id, span_id, parent_span_id, name, type, status, start_time_unix_nano, end_time_unix_nano, content, dimension_attributes) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (key, value, run_uuid) FROM stdin;
mlflow.user	aspl96	deaac430e91941bc9dc71faf893bcecd
mlflow.source.name	src/models/train.py	deaac430e91941bc9dc71faf893bcecd
mlflow.source.type	LOCAL	deaac430e91941bc9dc71faf893bcecd
mlflow.source.git.commit	c30978838ba5b93e35179fa571c076d7e356c232	deaac430e91941bc9dc71faf893bcecd
mlflow.source.git.branch	main	deaac430e91941bc9dc71faf893bcecd
mlflow.source.git.repoURL	https://github.com/AshoreSystems/ChurnGuard.git	deaac430e91941bc9dc71faf893bcecd
mlflow.runName	xgboost_candidate	deaac430e91941bc9dc71faf893bcecd
mlflow.user	aspl96	0913f33d1cbc46ffb1e77ae32e9c01df
mlflow.source.name	src/models/train.py	0913f33d1cbc46ffb1e77ae32e9c01df
mlflow.source.type	LOCAL	0913f33d1cbc46ffb1e77ae32e9c01df
mlflow.source.git.commit	c30978838ba5b93e35179fa571c076d7e356c232	0913f33d1cbc46ffb1e77ae32e9c01df
mlflow.source.git.branch	main	0913f33d1cbc46ffb1e77ae32e9c01df
mlflow.source.git.repoURL	https://github.com/AshoreSystems/ChurnGuard.git	0913f33d1cbc46ffb1e77ae32e9c01df
mlflow.runName	xgboost_candidate	0913f33d1cbc46ffb1e77ae32e9c01df
mlflow.user	aspl96	23bd6d4cac34414693e111cc1dca148f
mlflow.source.name	src/models/train.py	23bd6d4cac34414693e111cc1dca148f
mlflow.source.type	LOCAL	23bd6d4cac34414693e111cc1dca148f
mlflow.source.git.commit	c30978838ba5b93e35179fa571c076d7e356c232	23bd6d4cac34414693e111cc1dca148f
mlflow.source.git.branch	main	23bd6d4cac34414693e111cc1dca148f
mlflow.source.git.repoURL	https://github.com/AshoreSystems/ChurnGuard.git	23bd6d4cac34414693e111cc1dca148f
mlflow.runName	xgboost_candidate	23bd6d4cac34414693e111cc1dca148f
mlflow.user	aspl96	c8287e711c4143f79f7316249d28dcb2
mlflow.source.name	src/models/train.py	c8287e711c4143f79f7316249d28dcb2
mlflow.source.type	LOCAL	c8287e711c4143f79f7316249d28dcb2
mlflow.source.git.commit	c30978838ba5b93e35179fa571c076d7e356c232	c8287e711c4143f79f7316249d28dcb2
mlflow.source.git.branch	main	c8287e711c4143f79f7316249d28dcb2
mlflow.source.git.repoURL	https://github.com/AshoreSystems/ChurnGuard.git	c8287e711c4143f79f7316249d28dcb2
mlflow.runName	xgboost_candidate	c8287e711c4143f79f7316249d28dcb2
mlflow.user	aspl96	58be24d743d14dbdbffd75c3242c8f1a
mlflow.source.name	src/models/train.py	58be24d743d14dbdbffd75c3242c8f1a
mlflow.source.type	LOCAL	58be24d743d14dbdbffd75c3242c8f1a
mlflow.source.git.commit	c30978838ba5b93e35179fa571c076d7e356c232	58be24d743d14dbdbffd75c3242c8f1a
mlflow.source.git.branch	main	58be24d743d14dbdbffd75c3242c8f1a
mlflow.source.git.repoURL	https://github.com/AshoreSystems/ChurnGuard.git	58be24d743d14dbdbffd75c3242c8f1a
mlflow.runName	xgboost_candidate	58be24d743d14dbdbffd75c3242c8f1a
mlflow.user	root	6fc4d8918d0a4ccb9fd203d8a79ce6d5
mlflow.source.name	src/models/train.py	6fc4d8918d0a4ccb9fd203d8a79ce6d5
mlflow.source.type	LOCAL	6fc4d8918d0a4ccb9fd203d8a79ce6d5
mlflow.runName	fintech_calibrated_xgboost	6fc4d8918d0a4ccb9fd203d8a79ce6d5
mlflow.user	root	72da8640114c4615b91f12699629d3c1
mlflow.source.name	src/models/train.py	72da8640114c4615b91f12699629d3c1
mlflow.source.type	LOCAL	72da8640114c4615b91f12699629d3c1
mlflow.runName	fintech_calibrated_xgboost	72da8640114c4615b91f12699629d3c1
mlflow.user	root	1c2802434d0a45ef9b924b8b1821e585
mlflow.source.name	src/models/train.py	1c2802434d0a45ef9b924b8b1821e585
mlflow.source.type	LOCAL	1c2802434d0a45ef9b924b8b1821e585
mlflow.runName	fintech_calibrated_xgboost	1c2802434d0a45ef9b924b8b1821e585
mlflow.user	root	53009b8d3d204ec0863ac3b241f0be0e
mlflow.source.name	src/models/train.py	53009b8d3d204ec0863ac3b241f0be0e
mlflow.source.type	LOCAL	53009b8d3d204ec0863ac3b241f0be0e
mlflow.runName	fintech_calibrated_xgboost	53009b8d3d204ec0863ac3b241f0be0e
\.


--
-- Data for Name: trace_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trace_info (request_id, experiment_id, timestamp_ms, execution_time_ms, status, client_request_id, request_preview, response_preview, db_payload_generation) FROM stdin;
\.


--
-- Data for Name: trace_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trace_metrics (request_id, key, value) FROM stdin;
\.


--
-- Data for Name: trace_request_metadata; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trace_request_metadata (key, value, request_id) FROM stdin;
\.


--
-- Data for Name: trace_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trace_tags (key, value, request_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, hashed_password, full_name, is_active, role, organization_id, created_at, profile_picture_url, two_factor_code, two_factor_expires_at) FROM stdin;
3	test@gmail.com	$2b$12$7tV94VvA394XTifzHojX3uJzWWFIg4j.wqc1120LUqXBhqUg9ZwUG	Harshal Jadhav	t	DATA_ANALYST	2	2026-08-26 12:41:58.620196+00	\N	\N	\N
1	admin@churnguard.com	$2b$12$kOQWD6jIlnVsHHVLLIMGMedIIE1hlgUpyQ3ne4.2nPH2fercMnJIa	Super Admin	t	SUPER_ADMIN	2	2026-08-26 11:56:36.240204+00	\N	\N	\N
2	backupharshal7@gmail.com	$2b$12$mn.A3aq8bnct.QJo/p0s5OSlFQ/Pv7/NSbkQ5nx6J2kEiET3rW7E2	Harshal Jadhav	t	VIEWER	2	2026-08-26 12:28:19.26173+00	\N	195563	2026-09-07 06:51:39.782131+00
\.


--
-- Data for Name: webhook_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.webhook_events (webhook_id, entity, action) FROM stdin;
\.


--
-- Data for Name: webhooks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.webhooks (webhook_id, name, description, url, status, secret, creation_timestamp, last_updated_timestamp, deleted_timestamp, workspace) FROM stdin;
\.


--
-- Data for Name: workspaces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workspaces (name, description, default_artifact_root, trace_archival_location, trace_archival_retention) FROM stdin;
default	Default workspace for legacy resources	\N	\N	\N
\.


--
-- Name: api_keys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.api_keys_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 96, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 440843, true);


--
-- Name: experiments_experiment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.experiments_experiment_id_seq', 2, true);


--
-- Name: models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.models_id_seq', 1, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 2, true);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organizations_id_seq', 2, true);


--
-- Name: prediction_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prediction_history_id_seq', 1871142, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pk PRIMARY KEY (assessment_id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: budget_policies budget_policies_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_policies
    ADD CONSTRAINT budget_policies_pk PRIMARY KEY (budget_policy_id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: datasets dataset_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.datasets
    ADD CONSTRAINT dataset_pk PRIMARY KEY (experiment_id, name, digest);


--
-- Name: endpoint_bindings endpoint_bindings_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endpoint_bindings
    ADD CONSTRAINT endpoint_bindings_pk PRIMARY KEY (endpoint_id, resource_type, resource_id);


--
-- Name: endpoint_model_mappings endpoint_model_mappings_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endpoint_model_mappings
    ADD CONSTRAINT endpoint_model_mappings_pk PRIMARY KEY (mapping_id);


--
-- Name: endpoint_tags endpoint_tag_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endpoint_tags
    ADD CONSTRAINT endpoint_tag_pk PRIMARY KEY (key, endpoint_id);


--
-- Name: endpoints endpoints_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endpoints
    ADD CONSTRAINT endpoints_pk PRIMARY KEY (endpoint_id);


--
-- Name: entity_associations entity_associations_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entity_associations
    ADD CONSTRAINT entity_associations_pk PRIMARY KEY (source_type, source_id, destination_type, destination_id);


--
-- Name: evaluation_dataset_records evaluation_dataset_records_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_dataset_records
    ADD CONSTRAINT evaluation_dataset_records_pk PRIMARY KEY (dataset_record_id);


--
-- Name: evaluation_dataset_tags evaluation_dataset_tags_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_dataset_tags
    ADD CONSTRAINT evaluation_dataset_tags_pk PRIMARY KEY (dataset_id, key);


--
-- Name: evaluation_datasets evaluation_datasets_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_datasets
    ADD CONSTRAINT evaluation_datasets_pk PRIMARY KEY (dataset_id);


--
-- Name: experiments experiment_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT experiment_pk PRIMARY KEY (experiment_id);


--
-- Name: experiment_tags experiment_tag_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiment_tags
    ADD CONSTRAINT experiment_tag_pk PRIMARY KEY (key, experiment_id);


--
-- Name: guardrail_configs guardrail_configs_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardrail_configs
    ADD CONSTRAINT guardrail_configs_pk PRIMARY KEY (endpoint_id, guardrail_id);


--
-- Name: guardrails guardrails_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardrails
    ADD CONSTRAINT guardrails_pk PRIMARY KEY (guardrail_id);


--
-- Name: input_tags input_tags_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.input_tags
    ADD CONSTRAINT input_tags_pk PRIMARY KEY (input_uuid, name);


--
-- Name: inputs inputs_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inputs
    ADD CONSTRAINT inputs_pk PRIMARY KEY (source_type, source_id, destination_type, destination_id);


--
-- Name: issues issues_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_pk PRIMARY KEY (issue_id);


--
-- Name: jobs jobs_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pk PRIMARY KEY (id);


--
-- Name: label_schemas label_schemas_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.label_schemas
    ADD CONSTRAINT label_schemas_pk PRIMARY KEY (schema_id);


--
-- Name: latest_metrics latest_metric_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.latest_metrics
    ADD CONSTRAINT latest_metric_pk PRIMARY KEY (key, run_uuid);


--
-- Name: logged_model_metrics logged_model_metrics_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logged_model_metrics
    ADD CONSTRAINT logged_model_metrics_pk PRIMARY KEY (model_id, metric_name, metric_timestamp_ms, metric_step, run_id);


--
-- Name: logged_model_params logged_model_params_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logged_model_params
    ADD CONSTRAINT logged_model_params_pk PRIMARY KEY (model_id, param_key);


--
-- Name: logged_model_tags logged_model_tags_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logged_model_tags
    ADD CONSTRAINT logged_model_tags_pk PRIMARY KEY (model_id, tag_key);


--
-- Name: logged_models logged_models_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logged_models
    ADD CONSTRAINT logged_models_pk PRIMARY KEY (model_id);


--
-- Name: mcp_access_endpoints mcp_access_endpoints_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mcp_access_endpoints
    ADD CONSTRAINT mcp_access_endpoints_pk PRIMARY KEY (id);


--
-- Name: mcp_server_aliases mcp_server_aliases_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mcp_server_aliases
    ADD CONSTRAINT mcp_server_aliases_pk PRIMARY KEY (workspace, name, alias);


--
-- Name: mcp_server_tags mcp_server_tags_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mcp_server_tags
    ADD CONSTRAINT mcp_server_tags_pk PRIMARY KEY (workspace, name, key);


--
-- Name: mcp_server_version_tags mcp_server_version_tags_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mcp_server_version_tags
    ADD CONSTRAINT mcp_server_version_tags_pk PRIMARY KEY (workspace, name, version, key);


--
-- Name: mcp_server_versions mcp_server_versions_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mcp_server_versions
    ADD CONSTRAINT mcp_server_versions_pk PRIMARY KEY (workspace, name, version);


--
-- Name: mcp_servers mcp_servers_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mcp_servers
    ADD CONSTRAINT mcp_servers_pk PRIMARY KEY (workspace, name);


--
-- Name: metrics metric_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metric_pk PRIMARY KEY (key, "timestamp", step, run_uuid, value, is_nan);


--
-- Name: model_definitions model_definitions_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_definitions
    ADD CONSTRAINT model_definitions_pk PRIMARY KEY (model_definition_id);


--
-- Name: model_versions model_version_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_versions
    ADD CONSTRAINT model_version_pk PRIMARY KEY (workspace, name, version);


--
-- Name: model_version_tags model_version_tag_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_version_tags
    ADD CONSTRAINT model_version_tag_pk PRIMARY KEY (workspace, key, name, version);


--
-- Name: models models_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.models
    ADD CONSTRAINT models_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: online_scoring_configs online_scoring_config_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.online_scoring_configs
    ADD CONSTRAINT online_scoring_config_pk PRIMARY KEY (online_scoring_config_id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: params param_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.params
    ADD CONSTRAINT param_pk PRIMARY KEY (key, run_uuid);


--
-- Name: prediction_history prediction_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prediction_history
    ADD CONSTRAINT prediction_history_pkey PRIMARY KEY (id);


--
-- Name: registered_model_aliases registered_model_alias_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registered_model_aliases
    ADD CONSTRAINT registered_model_alias_pk PRIMARY KEY (workspace, name, alias);


--
-- Name: registered_models registered_model_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registered_models
    ADD CONSTRAINT registered_model_pk PRIMARY KEY (workspace, name);


--
-- Name: registered_model_tags registered_model_tag_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registered_model_tags
    ADD CONSTRAINT registered_model_tag_pk PRIMARY KEY (workspace, key, name);


--
-- Name: review_queue_items review_queue_items_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_queue_items
    ADD CONSTRAINT review_queue_items_pk PRIMARY KEY (queue_id, item_id);


--
-- Name: review_queue_label_schemas review_queue_label_schemas_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_queue_label_schemas
    ADD CONSTRAINT review_queue_label_schemas_pk PRIMARY KEY (queue_id, schema_id);


--
-- Name: review_queue_users review_queue_users_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_queue_users
    ADD CONSTRAINT review_queue_users_pk PRIMARY KEY (queue_id, user_id);


--
-- Name: review_queues review_queues_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_queues
    ADD CONSTRAINT review_queues_pk PRIMARY KEY (queue_id);


--
-- Name: runs run_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.runs
    ADD CONSTRAINT run_pk PRIMARY KEY (run_uuid);


--
-- Name: scorers scorer_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scorers
    ADD CONSTRAINT scorer_pk PRIMARY KEY (scorer_id);


--
-- Name: scorer_versions scorer_version_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scorer_versions
    ADD CONSTRAINT scorer_version_pk PRIMARY KEY (scorer_id, scorer_version);


--
-- Name: secrets secrets_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT secrets_pk PRIMARY KEY (secret_id);


--
-- Name: span_metrics span_metrics_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.span_metrics
    ADD CONSTRAINT span_metrics_pk PRIMARY KEY (trace_id, span_id, key);


--
-- Name: spans spans_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spans
    ADD CONSTRAINT spans_pk PRIMARY KEY (trace_id, span_id);


--
-- Name: tags tag_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tag_pk PRIMARY KEY (key, run_uuid);


--
-- Name: trace_info trace_info_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trace_info
    ADD CONSTRAINT trace_info_pk PRIMARY KEY (request_id);


--
-- Name: trace_metrics trace_metrics_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trace_metrics
    ADD CONSTRAINT trace_metrics_pk PRIMARY KEY (request_id, key);


--
-- Name: trace_request_metadata trace_request_metadata_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trace_request_metadata
    ADD CONSTRAINT trace_request_metadata_pk PRIMARY KEY (key, request_id);


--
-- Name: trace_tags trace_tag_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trace_tags
    ADD CONSTRAINT trace_tag_pk PRIMARY KEY (key, request_id);


--
-- Name: evaluation_dataset_records unique_dataset_input; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_dataset_records
    ADD CONSTRAINT unique_dataset_input UNIQUE (dataset_id, input_hash);


--
-- Name: endpoints uq_endpoints_workspace_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endpoints
    ADD CONSTRAINT uq_endpoints_workspace_name UNIQUE (workspace, name);


--
-- Name: experiments uq_experiments_workspace_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT uq_experiments_workspace_name UNIQUE (workspace, name);


--
-- Name: label_schemas uq_label_schemas_exp_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.label_schemas
    ADD CONSTRAINT uq_label_schemas_exp_name UNIQUE (experiment_id, name);


--
-- Name: model_definitions uq_model_definitions_workspace_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_definitions
    ADD CONSTRAINT uq_model_definitions_workspace_name UNIQUE (workspace, name);


--
-- Name: review_queues uq_review_queues_experiment_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_queues
    ADD CONSTRAINT uq_review_queues_experiment_name_key UNIQUE (experiment_id, name_key);


--
-- Name: secrets uq_secrets_workspace_secret_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT uq_secrets_workspace_secret_name UNIQUE (workspace, secret_name);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webhook_events webhook_event_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhook_events
    ADD CONSTRAINT webhook_event_pk PRIMARY KEY (webhook_id, entity, action);


--
-- Name: webhooks webhook_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhook_pk PRIMARY KEY (webhook_id);


--
-- Name: workspaces workspaces_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pk PRIMARY KEY (name);


--
-- Name: idx_budget_policies_target_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_budget_policies_target_value ON public.budget_policies USING btree (target_value);


--
-- Name: idx_budget_policies_workspace; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_budget_policies_workspace ON public.budget_policies USING btree (workspace);


--
-- Name: idx_endpoints_workspace; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_endpoints_workspace ON public.endpoints USING btree (workspace);


--
-- Name: idx_evaluation_datasets_workspace; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evaluation_datasets_workspace ON public.evaluation_datasets USING btree (workspace);


--
-- Name: idx_experiments_workspace; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_experiments_workspace ON public.experiments USING btree (workspace);


--
-- Name: idx_experiments_workspace_creation_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_experiments_workspace_creation_time ON public.experiments USING btree (workspace, creation_time);


--
-- Name: idx_guardrail_configs_endpoint_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guardrail_configs_endpoint_id ON public.guardrail_configs USING btree (endpoint_id);


--
-- Name: idx_guardrail_configs_guardrail_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guardrail_configs_guardrail_id ON public.guardrail_configs USING btree (guardrail_id);


--
-- Name: idx_guardrails_scorer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guardrails_scorer ON public.guardrails USING btree (scorer_id, scorer_version);


--
-- Name: idx_guardrails_workspace; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guardrails_workspace ON public.guardrails USING btree (workspace);


--
-- Name: idx_mcp_server_versions_latest; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mcp_server_versions_latest ON public.mcp_server_versions USING btree (workspace, name, status, version_major DESC, version_minor DESC, version_patch DESC);


--
-- Name: idx_model_definitions_workspace; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_definitions_workspace ON public.model_definitions USING btree (workspace);


--
-- Name: idx_model_version_tags_workspace_name_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_model_version_tags_workspace_name_version ON public.model_version_tags USING btree (workspace, name, version);


--
-- Name: idx_registered_model_tags_workspace_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registered_model_tags_workspace_name ON public.registered_model_tags USING btree (workspace, name);


--
-- Name: idx_registered_models_workspace; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registered_models_workspace ON public.registered_models USING btree (workspace);


--
-- Name: idx_secrets_workspace; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_secrets_workspace ON public.secrets USING btree (workspace);


--
-- Name: idx_webhook_events_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhook_events_action ON public.webhook_events USING btree (action);


--
-- Name: idx_webhook_events_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhook_events_entity ON public.webhook_events USING btree (entity);


--
-- Name: idx_webhook_events_entity_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhook_events_entity_action ON public.webhook_events USING btree (entity, action);


--
-- Name: idx_webhooks_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhooks_name ON public.webhooks USING btree (name);


--
-- Name: idx_webhooks_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhooks_status ON public.webhooks USING btree (status);


--
-- Name: idx_webhooks_workspace; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhooks_workspace ON public.webhooks USING btree (workspace);


--
-- Name: index_assessments_assessment_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_assessments_assessment_type ON public.assessments USING btree (assessment_type);


--
-- Name: index_assessments_last_updated_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_assessments_last_updated_timestamp ON public.assessments USING btree (last_updated_timestamp);


--
-- Name: index_assessments_run_id_created_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_assessments_run_id_created_timestamp ON public.assessments USING btree (run_id, created_timestamp);


--
-- Name: index_assessments_trace_id_created_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_assessments_trace_id_created_timestamp ON public.assessments USING btree (trace_id, created_timestamp);


--
-- Name: index_datasets_dataset_uuid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_datasets_dataset_uuid ON public.datasets USING btree (dataset_uuid);


--
-- Name: index_datasets_experiment_id_dataset_source_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_datasets_experiment_id_dataset_source_type ON public.datasets USING btree (experiment_id, dataset_source_type);


--
-- Name: index_endpoint_model_mappings_endpoint_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_endpoint_model_mappings_endpoint_id ON public.endpoint_model_mappings USING btree (endpoint_id);


--
-- Name: index_endpoint_model_mappings_model_definition_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_endpoint_model_mappings_model_definition_id ON public.endpoint_model_mappings USING btree (model_definition_id);


--
-- Name: index_endpoint_tags_endpoint_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_endpoint_tags_endpoint_id ON public.endpoint_tags USING btree (endpoint_id);


--
-- Name: index_entity_associations_association_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_entity_associations_association_id ON public.entity_associations USING btree (association_id);


--
-- Name: index_entity_associations_reverse_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_entity_associations_reverse_lookup ON public.entity_associations USING btree (destination_type, destination_id, source_type, source_id);


--
-- Name: index_evaluation_dataset_records_dataset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_evaluation_dataset_records_dataset_id ON public.evaluation_dataset_records USING btree (dataset_id);


--
-- Name: index_evaluation_dataset_tags_dataset_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_evaluation_dataset_tags_dataset_id ON public.evaluation_dataset_tags USING btree (dataset_id);


--
-- Name: index_evaluation_datasets_created_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_evaluation_datasets_created_time ON public.evaluation_datasets USING btree (created_time);


--
-- Name: index_evaluation_datasets_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_evaluation_datasets_name ON public.evaluation_datasets USING btree (name);


--
-- Name: index_inputs_destination_type_destination_id_source_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_inputs_destination_type_destination_id_source_type ON public.inputs USING btree (destination_type, destination_id, source_type);


--
-- Name: index_inputs_input_uuid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_inputs_input_uuid ON public.inputs USING btree (input_uuid);


--
-- Name: index_issues_experiment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_issues_experiment_id ON public.issues USING btree (experiment_id);


--
-- Name: index_issues_source_run_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_issues_source_run_id ON public.issues USING btree (source_run_id);


--
-- Name: index_issues_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_issues_status ON public.issues USING btree (status);


--
-- Name: index_jobs_name_status_creation_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_jobs_name_status_creation_time ON public.jobs USING btree (job_name, workspace, status, creation_time);


--
-- Name: index_label_schemas_experiment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_label_schemas_experiment_id ON public.label_schemas USING btree (experiment_id);


--
-- Name: index_latest_metrics_run_uuid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_latest_metrics_run_uuid ON public.latest_metrics USING btree (run_uuid);


--
-- Name: index_logged_model_metrics_model_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_logged_model_metrics_model_id ON public.logged_model_metrics USING btree (model_id);


--
-- Name: index_metrics_run_uuid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_metrics_run_uuid ON public.metrics USING btree (run_uuid);


--
-- Name: index_metrics_run_uuid_key_step; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_metrics_run_uuid_key_step ON public.metrics USING btree (run_uuid, key, step);


--
-- Name: index_model_definitions_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_model_definitions_provider ON public.model_definitions USING btree (provider);


--
-- Name: index_model_definitions_secret_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_model_definitions_secret_id ON public.model_definitions USING btree (secret_id);


--
-- Name: index_params_run_uuid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_params_run_uuid ON public.params USING btree (run_uuid);


--
-- Name: index_review_queue_items_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_review_queue_items_item_id ON public.review_queue_items USING btree (item_id);


--
-- Name: index_review_queue_items_queue_id_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_review_queue_items_queue_id_status ON public.review_queue_items USING btree (queue_id, status);


--
-- Name: index_review_queue_label_schemas_schema_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_review_queue_label_schemas_schema_id ON public.review_queue_label_schemas USING btree (schema_id);


--
-- Name: index_review_queue_users_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_review_queue_users_user_id ON public.review_queue_users USING btree (user_id);


--
-- Name: index_review_queues_experiment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_review_queues_experiment_id ON public.review_queues USING btree (experiment_id);


--
-- Name: index_scorer_versions_scorer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_scorer_versions_scorer_id ON public.scorer_versions USING btree (scorer_id);


--
-- Name: index_scorers_experiment_id_scorer_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_scorers_experiment_id_scorer_name ON public.scorers USING btree (experiment_id, scorer_name);


--
-- Name: index_span_metrics_trace_id_span_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_span_metrics_trace_id_span_id ON public.span_metrics USING btree (trace_id, span_id);


--
-- Name: index_spans_experiment_id_duration; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spans_experiment_id_duration ON public.spans USING btree (experiment_id, duration_ns);


--
-- Name: index_spans_experiment_id_start_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spans_experiment_id_start_time ON public.spans USING btree (experiment_id, start_time_unix_nano);


--
-- Name: index_spans_experiment_id_status_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spans_experiment_id_status_type ON public.spans USING btree (experiment_id, status, type);


--
-- Name: index_spans_experiment_id_type_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spans_experiment_id_type_status ON public.spans USING btree (experiment_id, type, status);


--
-- Name: index_tags_run_uuid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_tags_run_uuid ON public.tags USING btree (run_uuid);


--
-- Name: index_trace_info_experiment_id_timestamp_ms; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_trace_info_experiment_id_timestamp_ms ON public.trace_info USING btree (experiment_id, timestamp_ms);


--
-- Name: index_trace_metrics_request_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_trace_metrics_request_id ON public.trace_metrics USING btree (request_id);


--
-- Name: index_trace_request_metadata_request_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_trace_request_metadata_request_id ON public.trace_request_metadata USING btree (request_id);


--
-- Name: index_trace_tags_request_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_trace_tags_request_id ON public.trace_tags USING btree (request_id);


--
-- Name: ix_api_keys_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_api_keys_id ON public.api_keys USING btree (id);


--
-- Name: ix_audit_logs_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_logs_id ON public.audit_logs USING btree (id);


--
-- Name: ix_customers_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_customers_customer_id ON public.customers USING btree (customer_id);


--
-- Name: ix_customers_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_customers_id ON public.customers USING btree (id);


--
-- Name: ix_mcp_access_endpoints_alias; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_mcp_access_endpoints_alias ON public.mcp_access_endpoints USING btree (workspace, server_name, server_alias);


--
-- Name: ix_mcp_access_endpoints_server_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_mcp_access_endpoints_server_name ON public.mcp_access_endpoints USING btree (workspace, server_name);


--
-- Name: ix_mcp_access_endpoints_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_mcp_access_endpoints_version ON public.mcp_access_endpoints USING btree (workspace, server_name, server_version);


--
-- Name: ix_models_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_models_id ON public.models USING btree (id);


--
-- Name: ix_notifications_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notifications_id ON public.notifications USING btree (id);


--
-- Name: ix_organizations_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_organizations_id ON public.organizations USING btree (id);


--
-- Name: ix_organizations_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_organizations_name ON public.organizations USING btree (name);


--
-- Name: ix_prediction_history_customer_db_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_prediction_history_customer_db_id ON public.prediction_history USING btree (customer_db_id);


--
-- Name: ix_prediction_history_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_prediction_history_id ON public.prediction_history USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: unique_endpoint_model_linkage_mapping; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_endpoint_model_linkage_mapping ON public.endpoint_model_mappings USING btree (endpoint_id, model_definition_id, linkage_type);


--
-- Name: secrets prevent_secrets_aad_mutation; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER prevent_secrets_aad_mutation BEFORE UPDATE ON public.secrets FOR EACH ROW EXECUTE FUNCTION public.prevent_secrets_aad_mutation();


--
-- Name: api_keys api_keys_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: audit_logs audit_logs_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: customers customers_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: experiment_tags experiment_tags_experiment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiment_tags
    ADD CONSTRAINT experiment_tags_experiment_id_fkey FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id);


--
-- Name: assessments fk_assessments_trace_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT fk_assessments_trace_id FOREIGN KEY (trace_id) REFERENCES public.trace_info(request_id) ON DELETE CASCADE;


--
-- Name: datasets fk_datasets_experiment_id_experiments; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.datasets
    ADD CONSTRAINT fk_datasets_experiment_id_experiments FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id) ON DELETE CASCADE;


--
-- Name: endpoint_bindings fk_endpoint_bindings_endpoint_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endpoint_bindings
    ADD CONSTRAINT fk_endpoint_bindings_endpoint_id FOREIGN KEY (endpoint_id) REFERENCES public.endpoints(endpoint_id) ON DELETE CASCADE;


--
-- Name: endpoint_model_mappings fk_endpoint_model_mappings_endpoint_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endpoint_model_mappings
    ADD CONSTRAINT fk_endpoint_model_mappings_endpoint_id FOREIGN KEY (endpoint_id) REFERENCES public.endpoints(endpoint_id) ON DELETE CASCADE;


--
-- Name: endpoint_model_mappings fk_endpoint_model_mappings_model_definition_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endpoint_model_mappings
    ADD CONSTRAINT fk_endpoint_model_mappings_model_definition_id FOREIGN KEY (model_definition_id) REFERENCES public.model_definitions(model_definition_id);


--
-- Name: endpoint_tags fk_endpoint_tags_endpoint_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endpoint_tags
    ADD CONSTRAINT fk_endpoint_tags_endpoint_id FOREIGN KEY (endpoint_id) REFERENCES public.endpoints(endpoint_id) ON DELETE CASCADE;


--
-- Name: endpoints fk_endpoints_experiment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endpoints
    ADD CONSTRAINT fk_endpoints_experiment_id FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id) ON DELETE SET NULL;


--
-- Name: evaluation_dataset_records fk_evaluation_dataset_records_dataset_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_dataset_records
    ADD CONSTRAINT fk_evaluation_dataset_records_dataset_id FOREIGN KEY (dataset_id) REFERENCES public.evaluation_datasets(dataset_id) ON DELETE CASCADE;


--
-- Name: evaluation_dataset_tags fk_evaluation_dataset_tags_dataset_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_dataset_tags
    ADD CONSTRAINT fk_evaluation_dataset_tags_dataset_id FOREIGN KEY (dataset_id) REFERENCES public.evaluation_datasets(dataset_id) ON DELETE CASCADE;


--
-- Name: guardrail_configs fk_guardrail_configs_endpoint_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardrail_configs
    ADD CONSTRAINT fk_guardrail_configs_endpoint_id FOREIGN KEY (endpoint_id) REFERENCES public.endpoints(endpoint_id) ON DELETE CASCADE;


--
-- Name: guardrail_configs fk_guardrail_configs_guardrail_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardrail_configs
    ADD CONSTRAINT fk_guardrail_configs_guardrail_id FOREIGN KEY (guardrail_id) REFERENCES public.guardrails(guardrail_id) ON DELETE CASCADE;


--
-- Name: guardrails fk_guardrails_action_endpoint_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardrails
    ADD CONSTRAINT fk_guardrails_action_endpoint_id FOREIGN KEY (action_endpoint_id) REFERENCES public.endpoints(endpoint_id) ON DELETE SET NULL;


--
-- Name: guardrails fk_guardrails_scorer_version; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardrails
    ADD CONSTRAINT fk_guardrails_scorer_version FOREIGN KEY (scorer_id, scorer_version) REFERENCES public.scorer_versions(scorer_id, scorer_version);


--
-- Name: issues fk_issues_experiment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT fk_issues_experiment_id FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id) ON DELETE CASCADE;


--
-- Name: issues fk_issues_source_run_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT fk_issues_source_run_id FOREIGN KEY (source_run_id) REFERENCES public.runs(run_uuid) ON DELETE SET NULL;


--
-- Name: label_schemas fk_label_schemas_experiment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.label_schemas
    ADD CONSTRAINT fk_label_schemas_experiment_id FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id) ON DELETE CASCADE;


--
-- Name: logged_model_metrics fk_logged_model_metrics_experiment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logged_model_metrics
    ADD CONSTRAINT fk_logged_model_metrics_experiment_id FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id);


--
-- Name: logged_model_metrics fk_logged_model_metrics_model_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logged_model_metrics
    ADD CONSTRAINT fk_logged_model_metrics_model_id FOREIGN KEY (model_id) REFERENCES public.logged_models(model_id) ON DELETE CASCADE;


--
-- Name: logged_model_metrics fk_logged_model_metrics_run_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logged_model_metrics
    ADD CONSTRAINT fk_logged_model_metrics_run_id FOREIGN KEY (run_id) REFERENCES public.runs(run_uuid) ON DELETE CASCADE;


--
-- Name: logged_model_params fk_logged_model_params_experiment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logged_model_params
    ADD CONSTRAINT fk_logged_model_params_experiment_id FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id);


--
-- Name: logged_model_params fk_logged_model_params_model_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logged_model_params
    ADD CONSTRAINT fk_logged_model_params_model_id FOREIGN KEY (model_id) REFERENCES public.logged_models(model_id) ON DELETE CASCADE;


--
-- Name: logged_model_tags fk_logged_model_tags_experiment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logged_model_tags
    ADD CONSTRAINT fk_logged_model_tags_experiment_id FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id);


--
-- Name: logged_model_tags fk_logged_model_tags_model_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logged_model_tags
    ADD CONSTRAINT fk_logged_model_tags_model_id FOREIGN KEY (model_id) REFERENCES public.logged_models(model_id) ON DELETE CASCADE;


--
-- Name: logged_models fk_logged_models_experiment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logged_models
    ADD CONSTRAINT fk_logged_models_experiment_id FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id) ON DELETE CASCADE;


--
-- Name: model_definitions fk_model_definitions_secret_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_definitions
    ADD CONSTRAINT fk_model_definitions_secret_id FOREIGN KEY (secret_id) REFERENCES public.secrets(secret_id) ON DELETE SET NULL;


--
-- Name: model_version_tags fk_model_version_tags_model_versions; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_version_tags
    ADD CONSTRAINT fk_model_version_tags_model_versions FOREIGN KEY (workspace, name, version) REFERENCES public.model_versions(workspace, name, version) ON UPDATE CASCADE;


--
-- Name: model_versions fk_model_versions_registered_models; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_versions
    ADD CONSTRAINT fk_model_versions_registered_models FOREIGN KEY (workspace, name) REFERENCES public.registered_models(workspace, name) ON UPDATE CASCADE;


--
-- Name: online_scoring_configs fk_online_scoring_configs_experiment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.online_scoring_configs
    ADD CONSTRAINT fk_online_scoring_configs_experiment_id FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id);


--
-- Name: online_scoring_configs fk_online_scoring_configs_scorer_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.online_scoring_configs
    ADD CONSTRAINT fk_online_scoring_configs_scorer_id FOREIGN KEY (scorer_id) REFERENCES public.scorers(scorer_id) ON DELETE CASCADE;


--
-- Name: registered_model_aliases fk_registered_model_aliases_registered_models; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registered_model_aliases
    ADD CONSTRAINT fk_registered_model_aliases_registered_models FOREIGN KEY (workspace, name) REFERENCES public.registered_models(workspace, name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: registered_model_tags fk_registered_model_tags_registered_models; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registered_model_tags
    ADD CONSTRAINT fk_registered_model_tags_registered_models FOREIGN KEY (workspace, name) REFERENCES public.registered_models(workspace, name) ON UPDATE CASCADE;


--
-- Name: review_queue_items fk_review_queue_items_queue_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_queue_items
    ADD CONSTRAINT fk_review_queue_items_queue_id FOREIGN KEY (queue_id) REFERENCES public.review_queues(queue_id) ON DELETE CASCADE;


--
-- Name: review_queue_label_schemas fk_review_queue_label_schemas_queue_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_queue_label_schemas
    ADD CONSTRAINT fk_review_queue_label_schemas_queue_id FOREIGN KEY (queue_id) REFERENCES public.review_queues(queue_id) ON DELETE CASCADE;


--
-- Name: review_queue_users fk_review_queue_users_queue_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_queue_users
    ADD CONSTRAINT fk_review_queue_users_queue_id FOREIGN KEY (queue_id) REFERENCES public.review_queues(queue_id) ON DELETE CASCADE;


--
-- Name: review_queues fk_review_queues_experiment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_queues
    ADD CONSTRAINT fk_review_queues_experiment_id FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id) ON DELETE CASCADE;


--
-- Name: scorer_versions fk_scorer_versions_scorer_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scorer_versions
    ADD CONSTRAINT fk_scorer_versions_scorer_id FOREIGN KEY (scorer_id) REFERENCES public.scorers(scorer_id) ON DELETE CASCADE;


--
-- Name: scorers fk_scorers_experiment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scorers
    ADD CONSTRAINT fk_scorers_experiment_id FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id) ON DELETE CASCADE;


--
-- Name: span_metrics fk_span_metrics_span; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.span_metrics
    ADD CONSTRAINT fk_span_metrics_span FOREIGN KEY (trace_id, span_id) REFERENCES public.spans(trace_id, span_id) ON DELETE CASCADE;


--
-- Name: spans fk_spans_experiment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spans
    ADD CONSTRAINT fk_spans_experiment_id FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id);


--
-- Name: spans fk_spans_trace_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spans
    ADD CONSTRAINT fk_spans_trace_id FOREIGN KEY (trace_id) REFERENCES public.trace_info(request_id) ON DELETE CASCADE;


--
-- Name: trace_info fk_trace_info_experiment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trace_info
    ADD CONSTRAINT fk_trace_info_experiment_id FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id) ON DELETE CASCADE;


--
-- Name: trace_metrics fk_trace_metrics_request_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trace_metrics
    ADD CONSTRAINT fk_trace_metrics_request_id FOREIGN KEY (request_id) REFERENCES public.trace_info(request_id) ON DELETE CASCADE;


--
-- Name: trace_request_metadata fk_trace_request_metadata_request_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trace_request_metadata
    ADD CONSTRAINT fk_trace_request_metadata_request_id FOREIGN KEY (request_id) REFERENCES public.trace_info(request_id) ON DELETE CASCADE;


--
-- Name: trace_tags fk_trace_tags_request_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trace_tags
    ADD CONSTRAINT fk_trace_tags_request_id FOREIGN KEY (request_id) REFERENCES public.trace_info(request_id) ON DELETE CASCADE;


--
-- Name: latest_metrics latest_metrics_run_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.latest_metrics
    ADD CONSTRAINT latest_metrics_run_uuid_fkey FOREIGN KEY (run_uuid) REFERENCES public.runs(run_uuid);


--
-- Name: mcp_access_endpoints mcp_access_endpoints_server_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mcp_access_endpoints
    ADD CONSTRAINT mcp_access_endpoints_server_fkey FOREIGN KEY (workspace, server_name) REFERENCES public.mcp_servers(workspace, name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mcp_server_aliases mcp_server_aliases_server_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mcp_server_aliases
    ADD CONSTRAINT mcp_server_aliases_server_fkey FOREIGN KEY (workspace, name) REFERENCES public.mcp_servers(workspace, name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mcp_server_tags mcp_server_tags_server_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mcp_server_tags
    ADD CONSTRAINT mcp_server_tags_server_fkey FOREIGN KEY (workspace, name) REFERENCES public.mcp_servers(workspace, name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mcp_server_version_tags mcp_server_version_tags_version_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mcp_server_version_tags
    ADD CONSTRAINT mcp_server_version_tags_version_fkey FOREIGN KEY (workspace, name, version) REFERENCES public.mcp_server_versions(workspace, name, version) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mcp_server_versions mcp_server_versions_server_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mcp_server_versions
    ADD CONSTRAINT mcp_server_versions_server_fkey FOREIGN KEY (workspace, name) REFERENCES public.mcp_servers(workspace, name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: metrics metrics_run_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_run_uuid_fkey FOREIGN KEY (run_uuid) REFERENCES public.runs(run_uuid);


--
-- Name: models models_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.models
    ADD CONSTRAINT models_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: params params_run_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.params
    ADD CONSTRAINT params_run_uuid_fkey FOREIGN KEY (run_uuid) REFERENCES public.runs(run_uuid);


--
-- Name: prediction_history prediction_history_customer_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prediction_history
    ADD CONSTRAINT prediction_history_customer_db_id_fkey FOREIGN KEY (customer_db_id) REFERENCES public.customers(id);


--
-- Name: prediction_history prediction_history_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prediction_history
    ADD CONSTRAINT prediction_history_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models(id);


--
-- Name: runs runs_experiment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.runs
    ADD CONSTRAINT runs_experiment_id_fkey FOREIGN KEY (experiment_id) REFERENCES public.experiments(experiment_id);


--
-- Name: tags tags_run_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_run_uuid_fkey FOREIGN KEY (run_uuid) REFERENCES public.runs(run_uuid);


--
-- Name: users users_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: webhook_events webhook_events_webhook_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhook_events
    ADD CONSTRAINT webhook_events_webhook_id_fkey FOREIGN KEY (webhook_id) REFERENCES public.webhooks(webhook_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict wv6rpiZ1jNiB4LSF3eGNwpumm8dMmNbHvINSPbXWXHSOSrCP0Q48hdpckCwOBgc

