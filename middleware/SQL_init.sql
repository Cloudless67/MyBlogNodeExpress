create database myblog;

use myblog;

create table category(
	name varchar(255) primary key,
    url varchar(255)
);

create table post(
	id int primary key auto_increment,
    category varchar(255),
    title varchar(255),
    writtentime datetime,
    body text,
    views int,
    foreign key (category) references category(name)
);