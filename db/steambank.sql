--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.6
-- Dumped by pg_dump version 9.5.6

-- Started on 2017-05-08 02:25:55

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE "steambank";
--
-- TOC entry 2150 (class 1262 OID 16393)
-- Name: SteamBank; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "steambank" WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'Russian_Russia.1251' LC_CTYPE = 'Russian_Russia.1251';


ALTER DATABASE "steambank" OWNER TO postgres;

\connect "steambank"

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 12355)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2153 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- TOC entry 568 (class 1247 OID 16424)
-- Name: trade_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE trade_status AS ENUM (
    'declined',
    'completed',
    'pending'
);


ALTER TYPE trade_status OWNER TO postgres;

--
-- TOC entry 557 (class 1247 OID 16400)
-- Name: user_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE user_status AS ENUM (
    'admin',
    'common',
    'banned',
    'upgraded'
);


ALTER TYPE user_status OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 182 (class 1259 OID 16409)
-- Name: Bot; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "Bot" (
    "SteamID" character varying(20) NOT NULL,
    login character varying(20) NOT NULL,
    password character varying(20) NOT NULL,
    mafile jsonb NOT NULL
);


ALTER TABLE "Bot" OWNER TO postgres;

--
-- TOC entry 185 (class 1259 OID 16431)
-- Name: Item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "Item" (
    "AppID" integer NOT NULL,
    "ContextID" integer NOT NULL,
    "AssetID" bigint NOT NULL,
    bot_id character varying(20) NOT NULL,
    owner_id character varying(20),
    status boolean NOT NULL,
    item_id integer NOT NULL
);


ALTER TABLE "Item" OWNER TO postgres;

--
-- TOC entry 187 (class 1259 OID 16450)
-- Name: Item_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "Item_item_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Item_item_id_seq" OWNER TO postgres;

--
-- TOC entry 2154 (class 0 OID 0)
-- Dependencies: 187
-- Name: Item_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "Item_item_id_seq" OWNED BY "Item".item_id;


--
-- TOC entry 181 (class 1259 OID 16394)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "User" (
    "SteamID" character varying(20) NOT NULL,
    balance integer NOT NULL,
    locked_balance integer NOT NULL,
    status user_status NOT NULL,
    reg_date timestamp without time zone NOT NULL,
    login_date time without time zone
);


ALTER TABLE "User" OWNER TO postgres;

--
-- TOC entry 184 (class 1259 OID 16419)
-- Name: trade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE trade (
    id integer NOT NULL,
    seller_id character varying(20) NOT NULL,
    buyer_id character varying(20) NOT NULL,
    price money NOT NULL,
    status trade_status NOT NULL,
    date timestamp without time zone NOT NULL
);


ALTER TABLE trade OWNER TO postgres;

--
-- TOC entry 183 (class 1259 OID 16417)
-- Name: trade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE trade_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE trade_id_seq OWNER TO postgres;

--
-- TOC entry 2155 (class 0 OID 0)
-- Dependencies: 183
-- Name: trade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE trade_id_seq OWNED BY trade.id;


--
-- TOC entry 186 (class 1259 OID 16436)
-- Name: trade_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE trade_items (
    trade_id integer NOT NULL,
    item_id integer NOT NULL
);


ALTER TABLE trade_items OWNER TO postgres;

--
-- TOC entry 2007 (class 2604 OID 16452)
-- Name: item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "Item" ALTER COLUMN item_id SET DEFAULT nextval('"Item_item_id_seq"'::regclass);


--
-- TOC entry 2006 (class 2604 OID 16422)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trade ALTER COLUMN id SET DEFAULT nextval('trade_id_seq'::regclass);


--
-- TOC entry 2011 (class 2606 OID 16416)
-- Name: Bot_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "Bot"
    ADD CONSTRAINT "Bot_pkey" PRIMARY KEY ("SteamID");


--
-- TOC entry 2018 (class 2606 OID 16459)
-- Name: Item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "Item"
    ADD CONSTRAINT "Item_pkey" PRIMARY KEY (item_id);


--
-- TOC entry 2009 (class 2606 OID 16398)
-- Name: SteamID; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "User"
    ADD CONSTRAINT "SteamID" PRIMARY KEY ("SteamID");


--
-- TOC entry 2014 (class 2606 OID 16461)
-- Name: trade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trade
    ADD CONSTRAINT trade_pkey PRIMARY KEY (id);


--
-- TOC entry 2022 (class 2606 OID 16457)
-- Name: uniq_item; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "Item"
    ADD CONSTRAINT uniq_item UNIQUE ("AppID", "ContextID", "AssetID", item_id);


--
-- TOC entry 2025 (class 2606 OID 16449)
-- Name: uniq_trade; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trade_items
    ADD CONSTRAINT uniq_trade UNIQUE (trade_id, item_id);


--
-- TOC entry 2016 (class 2606 OID 16486)
-- Name: uniq_trade_offer; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trade
    ADD CONSTRAINT uniq_trade_offer UNIQUE (seller_id, buyer_id, id);


--
-- TOC entry 2019 (class 1259 OID 16478)
-- Name: fki_BotID; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "fki_BotID" ON "Item" USING btree (bot_id);


--
-- TOC entry 2012 (class 1259 OID 16497)
-- Name: fki_BuyerID; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "fki_BuyerID" ON trade USING btree (buyer_id);


--
-- TOC entry 2020 (class 1259 OID 16484)
-- Name: fki_UserID; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "fki_UserID" ON "Item" USING btree (owner_id);


--
-- TOC entry 2023 (class 1259 OID 16467)
-- Name: fki_item_to_trade; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_item_to_trade ON trade_items USING btree (item_id);


--
-- TOC entry 2028 (class 2606 OID 16473)
-- Name: BotID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "Item"
    ADD CONSTRAINT "BotID" FOREIGN KEY (bot_id) REFERENCES "Bot"("SteamID");


--
-- TOC entry 2027 (class 2606 OID 16492)
-- Name: BuyerID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trade
    ADD CONSTRAINT "BuyerID" FOREIGN KEY (buyer_id) REFERENCES "User"("SteamID");


--
-- TOC entry 2026 (class 2606 OID 16487)
-- Name: SellerID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trade
    ADD CONSTRAINT "SellerID" FOREIGN KEY (seller_id) REFERENCES "User"("SteamID");


--
-- TOC entry 2029 (class 2606 OID 16479)
-- Name: UserID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "Item"
    ADD CONSTRAINT "UserID" FOREIGN KEY (owner_id) REFERENCES "User"("SteamID");


--
-- TOC entry 2030 (class 2606 OID 16462)
-- Name: item_to_trade; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trade_items
    ADD CONSTRAINT item_to_trade FOREIGN KEY (item_id) REFERENCES "Item"(item_id);


--
-- TOC entry 2031 (class 2606 OID 16468)
-- Name: trade; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trade_items
    ADD CONSTRAINT trade FOREIGN KEY (trade_id) REFERENCES trade(id);


--
-- TOC entry 2152 (class 0 OID 0)
-- Dependencies: 6
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2017-05-08 02:25:55

--
-- PostgreSQL database dump complete
--

