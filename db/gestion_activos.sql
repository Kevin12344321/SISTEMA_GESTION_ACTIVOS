--
-- PostgreSQL database dump
--

\restrict qyZdaLcUIsciyfiixCW4HETI92n7xcCbb7h9s2iHpz5kIaR5Ad95oakjRw0yJ7W

-- Dumped from database version 17.9
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: generar_codigo_activo(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generar_codigo_activo() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.codigo_activo := 'ACT-' || LPAD(NEW.id_activo::TEXT, 6, '0');
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activos (
    id_activo bigint NOT NULL,
    codigo_activo character varying(20) NOT NULL,
    id_tipo_activo bigint NOT NULL,
    marca character varying(100),
    modelo character varying(150),
    numero_serie character varying(150),
    estado character varying(30) DEFAULT 'En almacén'::character varying NOT NULL,
    id_usuario bigint,
    id_razon_social bigint,
    id_area bigint,
    id_nave bigint,
    id_ubicacion bigint,
    fecha_asignacion timestamp without time zone,
    fecha_baja timestamp without time zone,
    motivo_baja text,
    CONSTRAINT chk_activo_estado CHECK (((estado)::text = ANY (ARRAY[('En almacén'::character varying)::text, ('En uso'::character varying)::text, ('Baja'::character varying)::text])))
);


--
-- Name: activos_id_activo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.activos ALTER COLUMN id_activo ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.activos_id_activo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.areas (
    id_area bigint NOT NULL,
    id_razon_social bigint NOT NULL,
    nombre character varying(150) NOT NULL
);


--
-- Name: areas_id_area_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.areas ALTER COLUMN id_area ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.areas_id_area_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cuentas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cuentas (
    id_cuenta bigint NOT NULL,
    id_usuario bigint NOT NULL,
    nombre_usuario character varying(80) NOT NULL,
    password_hash text NOT NULL,
    rol character varying(30) NOT NULL,
    estado character varying(20) DEFAULT 'Activo'::character varying NOT NULL,
    CONSTRAINT chk_cuenta_estado CHECK (((estado)::text = ANY (ARRAY[('Activo'::character varying)::text, ('Inactivo'::character varying)::text]))),
    CONSTRAINT chk_cuenta_rol CHECK (((rol)::text = ANY (ARRAY[('Administrador'::character varying)::text, ('Consulta'::character varying)::text])))
);


--
-- Name: cuentas_id_cuenta_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.cuentas ALTER COLUMN id_cuenta ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cuentas_id_cuenta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: movimientos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movimientos (
    id_movimiento bigint NOT NULL,
    id_activo bigint NOT NULL,
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tipo_movimiento character varying(40) NOT NULL,
    id_usuario_anterior bigint,
    usuario_anterior character varying(250),
    id_razon_social_anterior bigint,
    razon_social_anterior character varying(150),
    id_area_anterior bigint,
    area_anterior character varying(150),
    id_nave_anterior bigint,
    nave_anterior character varying(150),
    id_ubicacion_anterior bigint,
    ubicacion_anterior character varying(150),
    estado_anterior character varying(30),
    id_usuario_nuevo bigint,
    usuario_nuevo character varying(250),
    id_razon_social_nueva bigint,
    razon_social_nueva character varying(150),
    id_area_nueva bigint,
    area_nueva character varying(150),
    id_nave_nueva bigint,
    nave_nueva character varying(150),
    id_ubicacion_nueva bigint,
    ubicacion_nueva character varying(150),
    estado_nuevo character varying(30) NOT NULL,
    observaciones text,
    CONSTRAINT chk_movimiento_estado_anterior CHECK (((estado_anterior IS NULL) OR ((estado_anterior)::text = ANY (ARRAY[('En almacén'::character varying)::text, ('En uso'::character varying)::text, ('Baja'::character varying)::text])))),
    CONSTRAINT chk_movimiento_estado_nuevo CHECK (((estado_nuevo)::text = ANY (ARRAY[('En almacén'::character varying)::text, ('En uso'::character varying)::text, ('Baja'::character varying)::text]))),
    CONSTRAINT chk_tipo_movimiento CHECK (((tipo_movimiento)::text = ANY (ARRAY[('Asignación'::character varying)::text, ('Cambio de usuario'::character varying)::text, ('Cambio de área'::character varying)::text, ('Cambio de razón social'::character varying)::text, ('Cambio de ubicación'::character varying)::text, ('Devolución'::character varying)::text, ('Baja'::character varying)::text])))
);


--
-- Name: movimientos_id_movimiento_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.movimientos ALTER COLUMN id_movimiento ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.movimientos_id_movimiento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: naves; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.naves (
    id_nave bigint NOT NULL,
    nombre character varying(150) NOT NULL
);


--
-- Name: naves_id_nave_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.naves ALTER COLUMN id_nave ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.naves_id_nave_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: razones_sociales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.razones_sociales (
    id_razon_social bigint NOT NULL,
    nombre character varying(150) NOT NULL
);


--
-- Name: razones_sociales_id_razon_social_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.razones_sociales ALTER COLUMN id_razon_social ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.razones_sociales_id_razon_social_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tipos_activo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipos_activo (
    id_tipo_activo bigint NOT NULL,
    nombre character varying(100) NOT NULL
);


--
-- Name: tipos_activo_id_tipo_activo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tipos_activo ALTER COLUMN id_tipo_activo ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tipos_activo_id_tipo_activo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ubicaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ubicaciones (
    id_ubicacion bigint NOT NULL,
    nombre character varying(150) NOT NULL,
    id_nave bigint,
    id_razon_social bigint,
    CONSTRAINT chk_ubicacion_contexto CHECK (((id_nave IS NOT NULL) OR (id_razon_social IS NOT NULL)))
);


--
-- Name: ubicaciones_id_ubicacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.ubicaciones ALTER COLUMN id_ubicacion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ubicaciones_id_ubicacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id_usuario bigint NOT NULL,
    numero_nomina character varying(50) NOT NULL,
    nombre character varying(100) NOT NULL,
    apellidos character varying(150) NOT NULL,
    puesto character varying(150) NOT NULL,
    id_razon_social bigint NOT NULL,
    id_area bigint NOT NULL,
    id_nave bigint,
    id_ubicacion bigint,
    estado character varying(20) DEFAULT 'Activo'::character varying NOT NULL,
    CONSTRAINT chk_usuario_estado CHECK (((estado)::text = ANY (ARRAY[('Activo'::character varying)::text, ('Inactivo'::character varying)::text])))
);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.usuarios ALTER COLUMN id_usuario ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.usuarios_id_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: activos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activos (id_activo, codigo_activo, id_tipo_activo, marca, modelo, numero_serie, estado, id_usuario, id_razon_social, id_area, id_nave, id_ubicacion, fecha_asignacion, fecha_baja, motivo_baja) FROM stdin;
1	ACT-000001	1	Dell	Latitude 5420	PRUEBA-001	En uso	1	1	1	\N	\N	2026-08-25 21:01:39.415548	\N	\N
4	ACT-000004	1	Lenovo	ThinkPad E14	PRUEBA-003	En uso	2	1	1	\N	\N	2026-08-26 18:15:12.805802	\N	\N
5	ACT-000005	1	Acer	TravelMate	PRUEBA-004	En uso	2	2	2	1	3	2026-08-26 18:36:57.541581	\N	\N
6	ACT-000006	1	Dell	Latitude 3410	PRUEBA-BAJA-001	Baja	\N	\N	\N	\N	\N	\N	2026-08-26 19:07:59.611187	Equipo obsoleto para pruebas
3	ACT-000003	1	HP	ProBook 450	PRUEBA-002	Baja	\N	\N	\N	\N	\N	\N	2026-08-26 22:58:43.517138	Equipo viejo
\.


--
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.areas (id_area, id_razon_social, nombre) FROM stdin;
1	1	Sistemas
2	1	Administración
3	3	Recursos Humanos
\.


--
-- Data for Name: cuentas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cuentas (id_cuenta, id_usuario, nombre_usuario, password_hash, rol, estado) FROM stdin;
1	1	admin	$2b$10$At2eldZG55zrKPK4o1PmEOSegk8mrLYQdyhPzRuDyXjqYp/kKT1iq	Administrador	Activo
3	2	maria	$2b$10$iBkPSXPwRQqlIhVnPP7GfeFevhcigb7SSHnjed9czR30DifrTVGUm	Consulta	Activo
7	6	kevin	$2b$10$6TfD9bHyLLyYicP.6qOUjuLnUOH/vo.w5JStJK7pzQqciSL7M1Nie	Administrador	Activo
\.


--
-- Data for Name: movimientos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.movimientos (id_movimiento, id_activo, fecha_hora, tipo_movimiento, id_usuario_anterior, usuario_anterior, id_razon_social_anterior, razon_social_anterior, id_area_anterior, area_anterior, id_nave_anterior, nave_anterior, id_ubicacion_anterior, ubicacion_anterior, estado_anterior, id_usuario_nuevo, usuario_nuevo, id_razon_social_nueva, razon_social_nueva, id_area_nueva, area_nueva, id_nave_nueva, nave_nueva, id_ubicacion_nueva, ubicacion_nueva, estado_nuevo, observaciones) FROM stdin;
1	1	2026-08-25 21:03:56.190714	Asignación	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	En almacén	1	Juan Pérez López	1	SERPROCAP	1	Sistemas	\N	\N	\N	\N	En uso	\N
2	3	2026-08-26 17:51:50.649407	Asignación	\N	 	\N	\N	\N	\N	\N	\N	\N	\N	En almacén	1	Juan Pérez López	1	SERPROCAP	1	Sistemas	\N	\N	\N	\N	En uso	\N
3	4	2026-08-26 18:15:12.805802	Asignación	\N	 	\N	\N	\N	\N	\N	\N	\N	\N	En almacén	2	Maria Gonzalez Lopez	1	SERPROCAP	1	Sistemas	\N	\N	\N	\N	En uso	\N
4	5	2026-08-26 18:23:16.078006	Asignación	\N	 	\N	\N	\N	\N	\N	\N	\N	\N	En almacén	4	Carlos Ramirez Torres	1	SERPROCAP	1	Sistemas	\N	\N	\N	\N	En uso	\N
5	5	2026-08-26 18:29:19.625569	Devolución	4	Carlos Ramirez Torres	1	SERPROCAP	1	Sistemas	\N	\N	\N	\N	En uso	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	En almacén	\N
6	5	2026-08-26 18:33:37.282423	Asignación	\N	 	\N	\N	\N	\N	\N	\N	\N	\N	En almacén	4	Carlos Ramirez Torres	1	SERPROCAP	1	Sistemas	\N	\N	\N	\N	En uso	\N
7	5	2026-08-26 18:36:57.541581	Cambio de usuario	4	Carlos Ramirez Torres	1	SERPROCAP	1	Sistemas	\N	\N	\N	\N	En uso	2	Maria Gonzalez Lopez	1	SERPROCAP	1	Sistemas	\N	\N	\N	\N	En uso	\N
8	5	2026-08-26 18:43:42.501045	Cambio de área	2	Maria Gonzalez Lopez	1	SERPROCAP	1	Sistemas	\N	\N	\N	\N	En uso	2	Maria Gonzalez Lopez	1	SERPROCAP	2	Administración	\N	\N	\N	\N	En uso	\N
9	5	2026-08-26 18:48:44.380426	Cambio de razón social	2	Maria Gonzalez Lopez	1	SERPROCAP	2	Administración	\N	\N	\N	\N	En uso	2	Maria Gonzalez Lopez	2	DL Médica	2	Administración	\N	\N	\N	\N	En uso	\N
10	5	2026-08-26 19:02:29.424797	Cambio de ubicación	2	Maria Gonzalez Lopez	2	DL Médica	2	Administración	\N	\N	\N	\N	En uso	2	Maria Gonzalez Lopez	2	DL Médica	2	Administración	1	Nave 1	3	Oficina Administrativa	En uso	\N
11	6	2026-08-26 19:07:59.611187	Baja	\N	 	\N	\N	\N	\N	\N	\N	\N	\N	En almacén	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Baja	\N
12	3	2026-08-26 22:01:19.015615	Devolución	1	Juan Pérez López	1	SERPROCAP	1	Sistemas	\N	\N	\N	\N	En uso	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	En almacén	\N
13	3	2026-08-26 22:09:20.649518	Asignación	\N	 	\N	\N	\N	\N	\N	\N	\N	\N	En almacén	2	Maria Gonzalez Lopez	1	SERPROCAP	1	Sistemas	1	Nave 1	4	Oficina de Sistemas	En uso	\N
14	3	2026-08-26 22:34:30.979004	Cambio de usuario	2	Maria Gonzalez Lopez	1	SERPROCAP	1	Sistemas	1	Nave 1	4	Oficina de Sistemas	En uso	4	Carlos Ramirez Torres	1	SERPROCAP	1	Sistemas	1	Nave 1	4	Oficina de Sistemas	En uso	\N
15	3	2026-08-26 22:45:37.209279	Cambio de área	4	Carlos Ramirez Torres	1	SERPROCAP	1	Sistemas	1	Nave 1	4	Oficina de Sistemas	En uso	4	Carlos Ramirez Torres	1	SERPROCAP	2	Administración	1	Nave 1	4	Oficina de Sistemas	En uso	\N
16	3	2026-08-26 22:50:05.530219	Cambio de razón social	4	Carlos Ramirez Torres	1	SERPROCAP	2	Administración	1	Nave 1	4	Oficina de Sistemas	En uso	4	Carlos Ramirez Torres	2	DL Médica	2	Administración	1	Nave 1	4	Oficina de Sistemas	En uso	\N
17	3	2026-08-26 22:53:55.079107	Cambio de ubicación	4	Carlos Ramirez Torres	2	DL Médica	2	Administración	1	Nave 1	4	Oficina de Sistemas	En uso	4	Carlos Ramirez Torres	2	DL Médica	2	Administración	1	Nave 1	3	Oficina Administrativa	En uso	\N
18	3	2026-08-26 22:58:43.517138	Baja	4	Carlos Ramirez Torres	2	DL Médica	2	Administración	1	Nave 1	3	Oficina Administrativa	En uso	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Baja	\N
\.


--
-- Data for Name: naves; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.naves (id_nave, nombre) FROM stdin;
1	Nave 1
2	Nave 2
3	Nave 3
\.


--
-- Data for Name: razones_sociales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.razones_sociales (id_razon_social, nombre) FROM stdin;
1	SERPROCAP
2	DL Médica
3	DENTILAB
\.


--
-- Data for Name: tipos_activo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipos_activo (id_tipo_activo, nombre) FROM stdin;
1	Laptop
3	Impresora de renta
\.


--
-- Data for Name: ubicaciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ubicaciones (id_ubicacion, nombre, id_nave, id_razon_social) FROM stdin;
3	Oficina Administrativa	1	2
4	Oficina de Sistemas	1	1
5	Oficina de Recursos Humanos	1	2
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id_usuario, numero_nomina, nombre, apellidos, puesto, id_razon_social, id_area, id_nave, id_ubicacion, estado) FROM stdin;
1	15482	Juan	Pérez López	Analista de Sistemas	1	1	\N	\N	Activo
2	20001	Maria	Gonzalez Lopez	Auxiliar Administrativo	1	1	\N	\N	Activo
4	30001	Carlos	Ramirez Torres	Auxiliar	1	1	\N	\N	Activo
5	83	Luis	Perez Estrada	Contador	1	1	1	4	Activo
6	071	kevin	patricio	analista de sistemas	1	1	1	4	Activo
\.


--
-- Name: activos_id_activo_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activos_id_activo_seq', 6, true);


--
-- Name: areas_id_area_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.areas_id_area_seq', 3, true);


--
-- Name: cuentas_id_cuenta_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cuentas_id_cuenta_seq', 7, true);


--
-- Name: movimientos_id_movimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.movimientos_id_movimiento_seq', 18, true);


--
-- Name: naves_id_nave_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.naves_id_nave_seq', 3, true);


--
-- Name: razones_sociales_id_razon_social_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.razones_sociales_id_razon_social_seq', 3, true);


--
-- Name: tipos_activo_id_tipo_activo_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipos_activo_id_tipo_activo_seq', 3, true);


--
-- Name: ubicaciones_id_ubicacion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ubicaciones_id_ubicacion_seq', 5, true);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 6, true);


--
-- Name: activos activos_codigo_activo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activos
    ADD CONSTRAINT activos_codigo_activo_key UNIQUE (codigo_activo);


--
-- Name: activos activos_numero_serie_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activos
    ADD CONSTRAINT activos_numero_serie_key UNIQUE (numero_serie);


--
-- Name: activos activos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activos
    ADD CONSTRAINT activos_pkey PRIMARY KEY (id_activo);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id_area);


--
-- Name: cuentas cuentas_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_id_usuario_key UNIQUE (id_usuario);


--
-- Name: cuentas cuentas_nombre_usuario_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_nombre_usuario_key UNIQUE (nombre_usuario);


--
-- Name: cuentas cuentas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_pkey PRIMARY KEY (id_cuenta);


--
-- Name: movimientos movimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT movimientos_pkey PRIMARY KEY (id_movimiento);


--
-- Name: naves naves_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.naves
    ADD CONSTRAINT naves_nombre_key UNIQUE (nombre);


--
-- Name: naves naves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.naves
    ADD CONSTRAINT naves_pkey PRIMARY KEY (id_nave);


--
-- Name: razones_sociales razones_sociales_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.razones_sociales
    ADD CONSTRAINT razones_sociales_nombre_key UNIQUE (nombre);


--
-- Name: razones_sociales razones_sociales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.razones_sociales
    ADD CONSTRAINT razones_sociales_pkey PRIMARY KEY (id_razon_social);


--
-- Name: tipos_activo tipos_activo_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_activo
    ADD CONSTRAINT tipos_activo_nombre_key UNIQUE (nombre);


--
-- Name: tipos_activo tipos_activo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_activo
    ADD CONSTRAINT tipos_activo_pkey PRIMARY KEY (id_tipo_activo);


--
-- Name: ubicaciones ubicaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ubicaciones
    ADD CONSTRAINT ubicaciones_pkey PRIMARY KEY (id_ubicacion);


--
-- Name: areas uq_area_razon_social_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT uq_area_razon_social_nombre UNIQUE (id_razon_social, nombre);


--
-- Name: usuarios usuarios_numero_nomina_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_numero_nomina_key UNIQUE (numero_nomina);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: uq_ubicacion_nave_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_ubicacion_nave_nombre ON public.ubicaciones USING btree (id_nave, nombre) WHERE (id_nave IS NOT NULL);


--
-- Name: uq_ubicacion_razon_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_ubicacion_razon_nombre ON public.ubicaciones USING btree (id_razon_social, nombre) WHERE (id_razon_social IS NOT NULL);


--
-- Name: activos trg_generar_codigo_activo; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_generar_codigo_activo BEFORE INSERT ON public.activos FOR EACH ROW EXECUTE FUNCTION public.generar_codigo_activo();


--
-- Name: activos fk_activo_area; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activos
    ADD CONSTRAINT fk_activo_area FOREIGN KEY (id_area) REFERENCES public.areas(id_area);


--
-- Name: activos fk_activo_nave; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activos
    ADD CONSTRAINT fk_activo_nave FOREIGN KEY (id_nave) REFERENCES public.naves(id_nave);


--
-- Name: activos fk_activo_razon_social; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activos
    ADD CONSTRAINT fk_activo_razon_social FOREIGN KEY (id_razon_social) REFERENCES public.razones_sociales(id_razon_social);


--
-- Name: activos fk_activo_tipo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activos
    ADD CONSTRAINT fk_activo_tipo FOREIGN KEY (id_tipo_activo) REFERENCES public.tipos_activo(id_tipo_activo);


--
-- Name: activos fk_activo_ubicacion; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activos
    ADD CONSTRAINT fk_activo_ubicacion FOREIGN KEY (id_ubicacion) REFERENCES public.ubicaciones(id_ubicacion);


--
-- Name: activos fk_activo_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activos
    ADD CONSTRAINT fk_activo_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: areas fk_area_razon_social; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT fk_area_razon_social FOREIGN KEY (id_razon_social) REFERENCES public.razones_sociales(id_razon_social);


--
-- Name: cuentas fk_cuenta_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT fk_cuenta_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: movimientos fk_movimiento_activo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT fk_movimiento_activo FOREIGN KEY (id_activo) REFERENCES public.activos(id_activo);


--
-- Name: ubicaciones fk_ubicacion_nave; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ubicaciones
    ADD CONSTRAINT fk_ubicacion_nave FOREIGN KEY (id_nave) REFERENCES public.naves(id_nave);


--
-- Name: ubicaciones fk_ubicacion_razon_social; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ubicaciones
    ADD CONSTRAINT fk_ubicacion_razon_social FOREIGN KEY (id_razon_social) REFERENCES public.razones_sociales(id_razon_social);


--
-- Name: usuarios fk_usuario_area; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_usuario_area FOREIGN KEY (id_area) REFERENCES public.areas(id_area);


--
-- Name: usuarios fk_usuario_nave; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_usuario_nave FOREIGN KEY (id_nave) REFERENCES public.naves(id_nave);


--
-- Name: usuarios fk_usuario_razon_social; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_usuario_razon_social FOREIGN KEY (id_razon_social) REFERENCES public.razones_sociales(id_razon_social);


--
-- Name: usuarios fk_usuario_ubicacion; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_usuario_ubicacion FOREIGN KEY (id_ubicacion) REFERENCES public.ubicaciones(id_ubicacion);


--
-- PostgreSQL database dump complete
--

\unrestrict qyZdaLcUIsciyfiixCW4HETI92n7xcCbb7h9s2iHpz5kIaR5Ad95oakjRw0yJ7W

