const users = [ 
  {
    '_id': '333333333333333333333300',
    "fullname": "First User",
    "username": "firstuser",
    "password": "$2a$10$QJCIX42iD5QMxLRgHHBJre2rH6c6nI24UysmSYtkmeFv6X8uS1kgi"
  }, 
  {
    "_id": "333333333333333333333301",
    "fullname": "Another User",
    "username": "anotheruser",
    "password": "$2a$10$fYhYfcY8vu7Kh4FRapgpU.xuYg639SpQZHiYlVHBHaaC6.SrT5mAW"
  },
  {
    "_id": "333333333333333333333302",
    "fullname": "Third User",
    "username": "thirduser",
    "password": "$2a$10$Q03XbexpHcXHbFzPpco/1OE/zP2Bo8knL3.2bVrK36Aypt/0IKCBi"
  },
  {
    "_id": "333333333333333333333303",
    "fullname": "Fourth User",
    "username": "fourthuser",
    "password": "$2a$10$cVuaAdCHTzQck8k8uV2gcurbEp04e5kWTECtvGF54bZtC/rWeSSKW"
  }
];

const tags = [
  {
    "_id": "222222222222222222222200",
    "name": "breed",
    "userId": "333333333333333333333300"
  },
  {
    "_id": "222222222222222222222201",
    "name": "hybrid",
    "userId": "333333333333333333333301"
  },
  {
    "_id": "222222222222222222222202",
    "name": "domestic",
    "userId": "333333333333333333333302"
  },
  {
    "_id": "222222222222222222222203",
    "name": "feral",
    "userId": "333333333333333333333303"
  }
];

const folders = [
  {
    '_id': '111111111111111111111100',
    'name': 'Archive',
    'userId': '333333333333333333333300'
  },
  {
    '_id': '111111111111111111111101',
    'name': 'Drafts',
    'userId': '333333333333333333333301'
  },
  {
    '_id': '111111111111111111111102',
    'name': 'Personal',
    'userId': '333333333333333333333302'
  },
  {
    '_id': '111111111111111111111103',
    'name': 'Work',
    'userId': '333333333333333333333303'
  }
];

const notes = [
  {
    '_id': '000000000000000000000000',
    'title': '5 life lessons learned from cats',
    'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'folderId': '111111111111111111111100',
    'tags': ['222222222222222222222200'],
    'userId': '333333333333333333333300'
  },
  {
    '_id': '000000000000000000000001',
    'title': "What the government doesn't want you to know about cats",
    'content': 'Posuere sollicitudin aliquam ultrices sagittis orci a. Feugiat sed lectus vestibulum mattis ullamcorper velit. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Velit egestas dui id ornare arcu odio. Molestie at elementum eu facilisis sed odio morbi. Tempor nec feugiat nisl pretium. At tempor commodo ullamcorper a lacus. Egestas dui id ornare arcu odio. Id cursus metus aliquam eleifend. Vitae sapien pellentesque habitant morbi tristique. Dis parturient montes nascetur ridiculus. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Aliquam faucibus purus in massa tempor nec feugiat nisl.',
    'folderId': '111111111111111111111100',
    'tags': ['222222222222222222222201'],
    'userId': '333333333333333333333301'
  },
  {
    '_id': '000000000000000000000002',
    'title': "The most boring article about cats you'll ever read",
    'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'folderId': '111111111111111111111100',
    'tags': ['222222222222222222222202'],
    'userId': '333333333333333333333302'
  },
  {
    '_id': '000000000000000000000003',
    'title': '7 things Lady Gaga has in common with cats',
    'content': 'Posuere sollicitudin aliquam ultrices sagittis orci a. Feugiat sed lectus vestibulum mattis ullamcorper velit. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Velit egestas dui id ornare arcu odio. Molestie at elementum eu facilisis sed odio morbi. Tempor nec feugiat nisl pretium. At tempor commodo ullamcorper a lacus. Egestas dui id ornare arcu odio. Id cursus metus aliquam eleifend. Vitae sapien pellentesque habitant morbi tristique. Dis parturient montes nascetur ridiculus. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Aliquam faucibus purus in massa tempor nec feugiat nisl.',
    'folderId': '111111111111111111111101',
    'tags': ['222222222222222222222200'],
    'userId': '333333333333333333333300'
  },
  {
    '_id': '000000000000000000000004',
    'title': "The most incredible article about cats you'll ever read",
    'content': 'Lorem ipsum dolor sit amet, boring consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'folderId': '111111111111111111111102',
    'tags': ['222222222222222222222201'],
    'userId': '333333333333333333333301'
  },
  {
    '_id': '000000000000000000000005',
    'title': '10 ways cats can help you live to 100',
    'content': 'Posuere sollicitudin aliquam ultrices sagittis orci a. Feugiat sed lectus vestibulum mattis ullamcorper velit. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Velit egestas dui id ornare arcu odio. Molestie at elementum eu facilisis sed odio morbi. Tempor nec feugiat nisl pretium. At tempor commodo ullamcorper a lacus. Egestas dui id ornare arcu odio. Id cursus metus aliquam eleifend. Vitae sapien pellentesque habitant morbi tristique. Dis parturient montes nascetur ridiculus. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Aliquam faucibus purus in massa tempor nec feugiat nisl.',
    'folderId': '111111111111111111111102',
    'tags': ['222222222222222222222202'],
    'userId': '333333333333333333333302'
  },
  {
    '_id': '000000000000000000000006',
    'title': '9 reasons you can blame the recession on cats',
    'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'folderId': '111111111111111111111102',
    'tags': ['222222222222222222222200'],
    'userId': '333333333333333333333300'
  },
  {
    '_id': '000000000000000000000007',
    'title': '10 ways marketers are making you addicted to cats',
    'content': 'Posuere sollicitudin aliquam ultrices sagittis orci a. Feugiat sed lectus vestibulum mattis ullamcorper velit. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Velit egestas dui id ornare arcu odio. Molestie at elementum eu facilisis sed odio morbi. Tempor nec feugiat nisl pretium. At tempor commodo ullamcorper a lacus. Egestas dui id ornare arcu odio. Id cursus metus aliquam eleifend. Vitae sapien pellentesque habitant morbi tristique. Dis parturient montes nascetur ridiculus. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Aliquam faucibus purus in massa tempor nec feugiat nisl.',
    'folderId': '111111111111111111111103',
    'tags': ['222222222222222222222201'],
    'userId': '333333333333333333333301'
  }
];

module.exports = { folders, notes, tags, users };