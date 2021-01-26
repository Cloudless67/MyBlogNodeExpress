create database if not exists myblog;

use myblog;

create table if not exists category(
    name varchar(255) primary key,
    url varchar(255)
);

create table if not exists post(
    id int primary key auto_increment,
    category varchar(255),
    title varchar(255),
    writtentime datetime,
    body text,
    views int,
    replies int,
    foreign key (category) references category(name)
);

create table if not exists reply(
    id int primary key auto_increment,
    pwd varchar(60),
    post_id int,
    writtentime datetime,
    nickname varchar(10),
    body text,
    foreign key (post_id) references post(id)
);